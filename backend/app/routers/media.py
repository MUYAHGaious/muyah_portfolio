"""Admin media library: upload, list, describe, delete."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from sqlalchemy import select
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession
from app.models import Media
from app.schemas.media import MediaOut, MediaUpdate
from app.services.media import InvalidUploadError, delete_stored, store_upload

router = APIRouter(prefix="/api/admin/media", tags=["media"])


@router.get("", response_model=list[MediaOut])
async def list_media(user: CurrentUser, db: DbSession) -> list[Media]:
    return list(await db.scalars(select(Media).order_by(Media.created_at.desc())))


@router.post("", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload_media(
    user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> Media:
    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File exceeds the {settings.max_upload_bytes // (1024 * 1024)}MB limit",
        )

    try:
        # Decoding and re-encoding is CPU-bound; keep it off the event loop.
        stored = await run_in_threadpool(store_upload, data)
    except InvalidUploadError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    record = Media(
        filename=stored.filename,
        original_name=(file.filename or "upload")[:255],
        mime=stored.mime,
        width=stored.width,
        height=stored.height,
        size_bytes=stored.size_bytes,
        variants=stored.variants,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.patch("/{media_id}", response_model=MediaOut)
async def update_media(
    media_id: int,
    payload: MediaUpdate,
    user: CurrentUser,
    db: DbSession,
) -> Media:
    record = await db.get(Media, media_id)
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Media not found")
    record.alt_text = payload.alt_text
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(media_id: int, user: CurrentUser, db: DbSession) -> None:
    record = await db.get(Media, media_id)
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Media not found")

    filename, variants = record.filename, dict(record.variants)
    # Rows referencing this media use ON DELETE SET NULL, so the delete cannot orphan
    # a project. Files are removed only after the row is gone.
    await db.delete(record)
    await db.commit()
    await run_in_threadpool(delete_stored, filename, variants)
