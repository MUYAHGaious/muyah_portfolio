"""Analytics collection and aggregation, including the privacy guarantees."""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.core.security import visitor_hash
from app.models import PageView
from app.services.analytics import classify_device, normalise_referrer, summarise


async def test_collect_records_a_view(client, db):
    response = await client.post(
        "/api/analytics/collect", json={"path": "/work", "referrer": "https://www.google.com/"}
    )

    assert response.status_code == 204
    view = await db.scalar(select(PageView))
    assert view.path == "/work"
    assert view.referrer == "google.com", "referrer should be reduced to a bare host"


async def test_collect_sets_no_cookie(client):
    response = await client.post("/api/analytics/collect", json={"path": "/"})
    assert "set-cookie" not in response.headers


async def test_collect_does_not_store_a_raw_ip(client, db):
    await client.post("/api/analytics/collect", json={"path": "/"})

    view = await db.scalar(select(PageView))
    assert len(view.visitor_hash) == 64
    assert "." not in view.visitor_hash


async def test_crawlers_are_not_counted(client, db):
    await client.post(
        "/api/analytics/collect",
        json={"path": "/"},
        headers={"user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)"},
    )

    assert await db.scalar(select(PageView)) is None


async def test_visitor_hash_stops_matching_after_a_day():
    """Rotating the salt is what prevents views being stitched into a profile."""
    today = datetime(2026, 8, 3, 12, 0, tzinfo=timezone.utc)
    tomorrow = today + timedelta(days=1)

    assert visitor_hash("1.2.3.4", "UA", today) == visitor_hash("1.2.3.4", "UA", today)
    assert visitor_hash("1.2.3.4", "UA", today) != visitor_hash("1.2.3.4", "UA", tomorrow)


async def test_summary_requires_authentication(client):
    assert (await client.get("/api/admin/analytics")).status_code == 401


async def test_summary_counts_views_and_unique_visitors(admin_client, db):
    today = date.today()
    db.add_all(
        [
            PageView(path="/", visitor_hash="visitor-a", day=today),
            PageView(path="/", visitor_hash="visitor-a", day=today),
            PageView(path="/work", visitor_hash="visitor-b", day=today),
        ]
    )
    await db.commit()

    summary = (await admin_client.get("/api/admin/analytics", params={"range": 7})).json()

    assert summary["total_views"] == 3
    assert summary["total_visitors"] == 2
    assert summary["top_paths"][0] == {"label": "/", "count": 2}


async def test_summary_emits_every_day_in_the_range_including_empty_ones(admin_client):
    summary = (await admin_client.get("/api/admin/analytics", params={"range": 7})).json()

    assert len(summary["daily"]) == 7, "charts need a continuous series, not just days with data"
    assert all(entry["views"] == 0 for entry in summary["daily"])


async def test_summary_excludes_views_outside_the_range(admin_client, db):
    today = date.today()
    db.add_all(
        [
            PageView(path="/", visitor_hash="recent", day=today),
            PageView(path="/", visitor_hash="ancient", day=today - timedelta(days=60)),
        ]
    )
    await db.commit()

    summary = (await admin_client.get("/api/admin/analytics", params={"range": 7})).json()
    assert summary["total_views"] == 1


async def test_an_unsupported_range_falls_back_to_thirty_days(admin_client):
    summary = (await admin_client.get("/api/admin/analytics", params={"range": 999})).json()
    assert summary["range_days"] == 30


async def test_direct_visits_are_labelled(admin_client, db):
    db.add(PageView(path="/", visitor_hash="v", referrer="", day=date.today()))
    await db.commit()

    summary = (await admin_client.get("/api/admin/analytics", params={"range": 7})).json()
    assert summary["top_referrers"][0]["label"] == "(direct)"


def test_device_classification():
    assert classify_device("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)") == "mobile"
    assert classify_device("Mozilla/5.0 (iPad; CPU OS 17_0)") == "tablet"
    assert classify_device("Mozilla/5.0 (Windows NT 10.0; Win64; x64)") == "desktop"
    assert classify_device("Googlebot/2.1") == "bot"


def test_referrer_normalisation():
    assert normalise_referrer("https://www.example.com/some/path?q=1") == "example.com"
    assert normalise_referrer("") == ""


async def test_summarise_is_callable_directly(db):
    """The aggregation service should not depend on the HTTP layer."""
    summary = await summarise(db, range_days=30)
    assert summary.range_days == 30
    assert len(summary.daily) == 30
