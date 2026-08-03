from datetime import datetime
from typing import Any

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, JSONType, timestamp_column, utcnow
from app.models.media import Media

SINGLETON_ID = 1


class SiteSettings(Base):
    """Site-wide copy and links. A single row, always id=1."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=SINGLETON_ID)
    name: Mapped[str] = mapped_column(String(200), default="")
    tagline: Mapped[str] = mapped_column(String(300), default="")
    bio_md: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(255), default="")

    # [{"label": "GitHub", "url": "https://..."}, ...]
    socials: Mapped[list[dict[str, Any]]] = mapped_column(JSONType, default=list)

    # Short line above the name in the hero, e.g. "Hello, I'm".
    greeting: Mapped[str] = mapped_column(String(100), default="Hello, I'm")

    resume_media_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    resume_media: Mapped[Media | None] = relationship(
        lazy="selectin", foreign_keys=[resume_media_id]
    )

    # Cut-out portrait for the hero.
    avatar_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    avatar: Mapped[Media | None] = relationship(lazy="selectin", foreign_keys=[avatar_id])

    updated_at: Mapped[datetime] = timestamp_column(onupdate=utcnow)
