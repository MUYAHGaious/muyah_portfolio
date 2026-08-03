"""Cookieless page-view collection and the admin summary."""

from datetime import datetime, timezone

from fastapi import APIRouter, Query, Request, Response, status

from app.core.deps import ClientIP, CurrentUser, DbSession
from app.core.security import visitor_hash
from app.models import PageView
from app.schemas.analytics import AnalyticsSummary, CollectRequest
from app.services.analytics import classify_device, normalise_referrer, summarise

router = APIRouter(prefix="/api", tags=["analytics"])

VALID_RANGES = (7, 30, 90)


@router.post("/analytics/collect", status_code=status.HTTP_204_NO_CONTENT)
async def collect(
    payload: CollectRequest,
    request: Request,
    db: DbSession,
    ip: ClientIP,
) -> Response:
    """Record a page view. No cookie is set and no raw IP is stored."""
    user_agent = request.headers.get("user-agent", "")
    device = classify_device(user_agent)

    # Crawlers are not visitors; counting them makes the numbers meaningless.
    if device == "bot":
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    now = datetime.now(timezone.utc)
    db.add(
        PageView(
            path=payload.path[:500],
            referrer=normalise_referrer(payload.referrer)[:500],
            visitor_hash=visitor_hash(ip, user_agent, now),
            device=device,
            day=now.date(),
            created_at=now,
        )
    )
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/admin/analytics", response_model=AnalyticsSummary)
async def analytics_summary(
    user: CurrentUser,
    db: DbSession,
    range_days: int = Query(default=30, alias="range"),
) -> AnalyticsSummary:
    if range_days not in VALID_RANGES:
        range_days = 30
    return await summarise(db, range_days)
