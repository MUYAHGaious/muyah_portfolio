"""Async SQLAlchemy engine, session factory, and declarative base."""

from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from sqlalchemy import DateTime, MetaData, types
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy.pool import StaticPool

from app.core.config import settings

# Explicit naming convention so Alembic can autogenerate reversible constraint names.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# JSONB on Postgres, plain JSON on SQLite so the test suite can run without a database
# server. No query relies on JSONB-specific operators, so the two behave identically here.
JSONType = types.JSON().with_variant(JSONB(), "postgresql")

# Postgres stores timezone-aware timestamps; SQLite drops the offset, so all values are
# normalised to UTC before they are written (see `utcnow`).
TimestampType = DateTime(timezone=True)


def utcnow() -> datetime:
    """Timezone-aware UTC now. Used as a column default across all models."""
    return datetime.now(timezone.utc)


def timestamp_column(**kwargs):
    return mapped_column(TimestampType, default=utcnow, **kwargs)


def _engine_options(url: str) -> dict:
    if url.startswith("sqlite"):
        # StaticPool keeps every session on one connection, which is what makes an
        # in-memory SQLite database visible across the whole test suite.
        return {
            "poolclass": StaticPool,
            "connect_args": {"check_same_thread": False},
        }
    return {"pool_size": 5, "max_overflow": 10, "pool_pre_ping": True}


engine = create_async_engine(settings.database_url, echo=False, **_engine_options(settings.database_url))

SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a session that rolls back on error."""
    async with SessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
