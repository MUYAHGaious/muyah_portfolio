from datetime import datetime

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, JSONType, TimestampType, timestamp_column, utcnow


class Post(Base):
    """A blog entry, authored as Markdown in the admin panel."""

    __tablename__ = "post"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    excerpt: Mapped[str] = mapped_column(String(500), default="")
    body_md: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list[str]] = mapped_column(JSONType, default=list)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    # Set when the post is first published; drives ordering and the public date line.
    published_at: Mapped[datetime | None] = mapped_column(TimestampType, nullable=True, index=True)

    created_at: Mapped[datetime] = timestamp_column()
    updated_at: Mapped[datetime] = timestamp_column(onupdate=utcnow)
