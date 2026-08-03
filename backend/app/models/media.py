from datetime import datetime
from typing import Any

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, JSONType, timestamp_column


class Media(Base):
    """An uploaded image, re-encoded to WebP at several widths.

    `filename` is the full-size file; `variants` maps a width in pixels to the
    filename of that rendition, e.g. {"640": "abc123-640.webp"}.
    """

    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), unique=True)
    original_name: Mapped[str] = mapped_column(String(255))
    alt_text: Mapped[str] = mapped_column(String(500), default="")
    mime: Mapped[str] = mapped_column(String(100))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    size_bytes: Mapped[int] = mapped_column(Integer)
    variants: Mapped[dict[str, Any]] = mapped_column(JSONType, default=dict)
    created_at: Mapped[datetime] = timestamp_column()
