"""Shared helpers for the admin CRUD routers."""

from typing import TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import Base

ModelT = TypeVar("ModelT", bound=Base)


def _plain(value):
    """Nested models become dicts with every field, defaults included."""
    if isinstance(value, BaseModel):
        return value.model_dump()
    if isinstance(value, list):
        return [_plain(item) for item in value]
    return value


def sent_fields(payload: BaseModel) -> dict:
    """The fields the client actually sent, as plain JSON-ready values.

    This is `model_dump(exclude_unset=True)` with one difference: nested models
    (a metric, an education entry) are dumped in full. `exclude_unset` applies
    recursively, so a nested item would otherwise lose its default fields and
    the stored JSON would be missing keys the public schema promises.
    """
    return {field: _plain(getattr(payload, field)) for field in payload.model_fields_set}


def apply_updates(instance: ModelT, payload: BaseModel) -> ModelT:
    """Copy only the fields the client actually sent onto the ORM instance.

    An omitted field is left alone, while an explicit null clears the column.
    """
    for field, value in sent_fields(payload).items():
        setattr(instance, field, value)
    return instance


async def get_or_404(db: AsyncSession, model: type[ModelT], record_id: int, label: str) -> ModelT:
    instance = await db.get(model, record_id)
    if instance is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{label} not found")
    return instance


async def ensure_slug_available(
    db: AsyncSession,
    model: type[ModelT],
    slug: str,
    exclude_id: int | None = None,
) -> None:
    """Reject a duplicate slug with 409 rather than letting the unique index raise a 500."""
    query = select(model.id).where(model.slug == slug)
    if exclude_id is not None:
        query = query.where(model.id != exclude_id)
    if await db.scalar(query) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"The slug '{slug}' is already in use")
