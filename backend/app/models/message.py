from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampType, timestamp_column


class Message(Base):
    """A contact-form submission.

    `ip_hash` is a salted hash used only for rate limiting — the raw IP is never stored.
    """

    __tablename__ = "message"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text)
    ip_hash: Mapped[str] = mapped_column(String(64), default="", index=True)
    read_at: Mapped[datetime | None] = mapped_column(TimestampType, nullable=True)
    created_at: Mapped[datetime] = timestamp_column(index=True)
