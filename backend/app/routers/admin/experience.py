from fastapi import APIRouter, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models import Experience
from app.routers.admin._helpers import apply_updates, get_or_404
from app.schemas.content import ExperienceCreate, ExperienceOut, ExperienceUpdate

router = APIRouter(prefix="/experience", tags=["admin:experience"])


@router.get("", response_model=list[ExperienceOut])
async def list_all(user: CurrentUser, db: DbSession) -> list[Experience]:
    return list(
        await db.scalars(
            select(Experience).order_by(
                Experience.sort_order.asc(), Experience.start_date.desc()
            )
        )
    )


@router.get("/{experience_id}", response_model=ExperienceOut)
async def get_one(experience_id: int, user: CurrentUser, db: DbSession) -> Experience:
    return await get_or_404(db, Experience, experience_id, "Experience")


@router.post("", response_model=ExperienceOut, status_code=status.HTTP_201_CREATED)
async def create(payload: ExperienceCreate, user: CurrentUser, db: DbSession) -> Experience:
    entry = Experience(**payload.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch("/{experience_id}", response_model=ExperienceOut)
async def update(
    experience_id: int, payload: ExperienceUpdate, user: CurrentUser, db: DbSession
) -> Experience:
    entry = await get_or_404(db, Experience, experience_id, "Experience")
    apply_updates(entry, payload)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(experience_id: int, user: CurrentUser, db: DbSession) -> None:
    entry = await get_or_404(db, Experience, experience_id, "Experience")
    await db.delete(entry)
    await db.commit()
