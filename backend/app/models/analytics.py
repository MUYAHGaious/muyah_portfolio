from datetime import date, datetime

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, timestamp_column


class PageView(Base):
    """One page view. Cookieless and not linkable to a person.

    `visitor_hash` is sha256(ip + user_agent + a salt that rotates daily), which
    supports a unique-visitor count for the current day and nothing beyond it.
    `day` is stored alongside `created_at` so daily aggregates group on an indexed
    column without dialect-specific date truncation.
    """

    __tablename__ = "page_view"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(String(500), index=True)
    referrer: Mapped[str] = mapped_column(String(500), default="")
    visitor_hash: Mapped[str] = mapped_column(String(64), index=True)
    country: Mapped[str] = mapped_column(String(2), default="")
    device: Mapped[str] = mapped_column(String(20), default="desktop")
    day: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = timestamp_column()
