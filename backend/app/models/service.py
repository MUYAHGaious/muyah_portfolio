from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, JSONType, timestamp_column
from app.models.media import Media


class Service(Base):
    """Something you offer.

    Drives the floating capability cards in the hero and the services section.
    `blurb` is the one-liner on the card; `body_md` is the longer description.
    """

    __tablename__ = "service"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    blurb: Mapped[str] = mapped_column(String(300), default="")
    body_md: Mapped[str] = mapped_column(Text, default="")

    # Short bullet list shown under the description, e.g. what's included.
    points: Mapped[list[str]] = mapped_column(JSONType, default=list)

    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    image: Mapped[Media | None] = relationship(lazy="selectin")

    # Only the first few appear as floating cards in the hero.
    featured: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, index=True)
    published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = timestamp_column()


class Testimonial(Base):
    """A quote from someone you worked with.

    Ships empty. Nothing here is ever generated — an invented endorsement is
    the single most damaging thing a portfolio can contain.
    """

    __tablename__ = "testimonial"

    id: Mapped[int] = mapped_column(primary_key=True)
    quote: Mapped[str] = mapped_column(Text)
    author: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(200), default="")
    avatar_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    avatar: Mapped[Media | None] = relationship(lazy="selectin")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, index=True)
    published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = timestamp_column()
