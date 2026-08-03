"""Contact form: persistence, spam handling, rate limiting, and mail failure."""

import aiosmtplib
import pytest
from sqlalchemy import func, select

from app.models import Message
from app.routers.contact import contact_limiter

VALID = {
    "name": "Ada",
    "email": "ada@example.com",
    "subject": "Work together?",
    "message": "I would like to talk about a project.",
    "elapsed_ms": 15_000,
}


async def _message_count(db) -> int:
    return await db.scalar(select(func.count()).select_from(Message)) or 0


async def test_valid_submission_is_stored(client, db):
    response = await client.post("/api/contact", json=VALID)

    assert response.status_code == 200
    assert response.json()["ok"] is True
    assert await _message_count(db) == 1


async def test_honeypot_submission_is_dropped_silently(client, db):
    response = await client.post("/api/contact", json={**VALID, "website": "http://spam.example"})

    # Success is reported so a bot cannot tell the honeypot exists.
    assert response.status_code == 200
    assert await _message_count(db) == 0


async def test_instant_submission_is_treated_as_a_bot(client, db):
    response = await client.post("/api/contact", json={**VALID, "elapsed_ms": 50})

    assert response.status_code == 200
    assert await _message_count(db) == 0


async def test_submission_without_timing_information_is_accepted(client, db):
    """An elapsed_ms of 0 means the field was absent — it must not block a real person."""
    response = await client.post("/api/contact", json={**VALID, "elapsed_ms": 0})

    assert response.status_code == 200
    assert await _message_count(db) == 1


@pytest.mark.parametrize(
    "override",
    [
        {"email": "not-an-email"},
        {"name": ""},
        {"message": "too short"},
    ],
)
async def test_invalid_input_is_rejected(client, override):
    assert (await client.post("/api/contact", json={**VALID, **override})).status_code == 422


async def test_submissions_are_rate_limited(client, db):
    for _ in range(contact_limiter.max_events):
        assert (await client.post("/api/contact", json=VALID)).status_code == 200

    blocked = await client.post("/api/contact", json=VALID)
    assert blocked.status_code == 429
    assert await _message_count(db) == contact_limiter.max_events


async def test_message_is_kept_when_smtp_fails(client, db, monkeypatch):
    """A broken mail server must never cost the owner a lead."""
    monkeypatch.setattr("app.services.email.settings.smtp_host", "smtp.invalid")

    async def explode(*args, **kwargs):
        raise aiosmtplib.SMTPConnectError("connection refused")

    monkeypatch.setattr(aiosmtplib, "send", explode)

    response = await client.post("/api/contact", json=VALID)

    assert response.status_code == 200, "the visitor should not see an SMTP failure"
    assert await _message_count(db) == 1


async def test_raw_ip_is_not_stored(client, db):
    await client.post("/api/contact", json=VALID)

    message = await db.scalar(select(Message))
    assert message.ip_hash
    assert len(message.ip_hash) == 64
    assert "." not in message.ip_hash and ":" not in message.ip_hash


async def test_message_appears_in_the_admin_inbox(admin_client, db):
    await admin_client.post("/api/contact", json=VALID)

    inbox = (await admin_client.get("/api/admin/messages")).json()
    assert inbox["total"] == 1
    assert inbox["unread"] == 1
    assert inbox["items"][0]["email"] == "ada@example.com"


async def test_marking_a_message_read_is_idempotent(admin_client):
    await admin_client.post("/api/contact", json=VALID)
    message_id = (await admin_client.get("/api/admin/messages")).json()["items"][0]["id"]

    first = (await admin_client.patch(f"/api/admin/messages/{message_id}/read")).json()
    second = (await admin_client.patch(f"/api/admin/messages/{message_id}/read")).json()

    assert first["read_at"] is not None
    assert first["read_at"] == second["read_at"]
    assert (await admin_client.get("/api/admin/messages")).json()["unread"] == 0
