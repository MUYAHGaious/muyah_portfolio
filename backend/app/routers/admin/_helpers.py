"""Shared helpers for the admin CRUD routers."""

from typing import TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import Base

ModelT = TypeVar("ModelT", bound=Base)


def apply_updates(instance: ModelT, payload: BaseModel) -> ModelT:
    """Copy only the fields the client actually sent onto the ORM instance.

    `exclude_unset` is what makes PATCH semantics work: an omitted field is left
    alone, while an explicit null clears the column.
    """
    for field, value in payload.model_dump(exclude_unset=True).items():
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
