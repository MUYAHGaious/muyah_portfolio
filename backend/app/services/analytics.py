"""Aggregation queries for the analytics dashboard.

All grouping happens on the indexed `day` column rather than a date-truncation
function, so the same SQL runs on Postgres and on SQLite under test.
"""

from datetime import date, timedelta
from urllib.parse import urlparse

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PageView
from app.schemas.analytics import AnalyticsSummary, DailyCount, LabelCount

TOP_N = 10


def classify_device(user_agent: str) -> str:
    """Coarse device bucket. Deliberately crude — no UA parsing library, no fingerprinting."""
    ua = user_agent.lower()
    if "ipad" in ua or ("tablet" in ua) or ("android" in ua and "mobile" not in ua):
        return "tablet"
    if any(token in ua for token in ("mobi", "iphone", "ipod", "android")):
        return "mobile"
    if any(token in ua for token in ("bot", "crawler", "spider", "headless")):
        return "bot"
    return "desktop"


def normalise_referrer(referrer: str) -> str:
    """Reduce a referrer URL to its host. Empty means a direct visit."""
    if not referrer:
        return ""
    try:
        host = urlparse(referrer).netloc.lower()
    except ValueError:
        return ""
    return host.removeprefix("www.")


async def _top(db: AsyncSession, column, since: date, exclude_empty: bool = False):
    query = (
        select(column, func.count().label("count"))
        .where(PageView.day >= since)
        .group_by(column)
        .order_by(func.count().desc())
        .limit(TOP_N)
    )
    if exclude_empty:
        query = query.where(column != "")
    rows = (await db.execute(query)).all()
    return [LabelCount(label=value or "(direct)", count=count) for value, count in rows]


async def summarise(db: AsyncSession, range_days: int, today: date | None = None) -> AnalyticsSummary:
    today = today or date.today()
    since = today - timedelta(days=range_days - 1)

    daily_rows = (
        await db.execute(
            select(
                PageView.day,
                func.count().label("views"),
                func.count(func.distinct(PageView.visitor_hash)).label("visitors"),
            )
            .where(PageView.day >= since)
            .group_by(PageView.day)
            .order_by(PageView.day.asc())
        )
    ).all()
    by_day = {row.day: row for row in daily_rows}

    # Emit every day in the range, including zeroes, so charts have no gaps.
    daily = [
        DailyCount(
            day=since + timedelta(days=offset),
            views=getattr(by_day.get(since + timedelta(days=offset)), "views", 0),
            visitors=getattr(by_day.get(since + timedelta(days=offset)), "visitors", 0),
        )
        for offset in range(range_days)
    ]

    total_views = sum(entry.views for entry in daily)
    total_visitors = (
        await db.scalar(
            select(func.count(func.distinct(PageView.visitor_hash))).where(PageView.day >= since)
        )
        or 0
    )

    return AnalyticsSummary(
        range_days=range_days,
        total_views=total_views,
        total_visitors=total_visitors,
        daily=daily,
        top_paths=await _top(db, PageView.path, since),
        top_referrers=await _top(db, PageView.referrer, since),
        devices=await _top(db, PageView.device, since),
    )
