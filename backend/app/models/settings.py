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

    resume_media_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    resume_media: Mapped[Media | None] = relationship(lazy="selectin")

    updated_at: Mapped[datetime] = timestamp_column(onupdate=utcnow)
