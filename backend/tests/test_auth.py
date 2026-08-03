"""Authentication: login, session cookie, rate limiting, and route protection."""

import pytest

from app.core.deps import SESSION_COOKIE
from app.core.security import hash_password, verify_password
from app.routers.auth import login_limiter
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


async def test_login_succeeds_and_sets_httponly_cookie(client):
    response = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )

    assert response.status_code == 200
    assert response.json()["email"] == ADMIN_EMAIL

    cookie = response.cookies.get(SESSION_COOKIE)
    assert cookie, "login must set a session cookie"

    set_cookie_header = response.headers["set-cookie"].lower()
    assert "httponly" in set_cookie_header, "session cookie must not be readable from JS"
    assert "samesite=lax" in set_cookie_header


async def test_login_rejects_wrong_password(client):
    response = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": "definitely-wrong"}
    )
    assert response.status_code == 401
    assert SESSION_COOKIE not in response.cookies


async def test_login_does_not_reveal_whether_an_account_exists(client):
    unknown = await client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": "whatever-123"}
    )
    wrong_password = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password"}
    )

    assert unknown.status_code == wrong_password.status_code == 401
    assert unknown.json()["detail"] == wrong_password.json()["detail"]


async def test_login_is_rate_limited(client):
    limit, _ = login_limiter.max_events, login_limiter.window_seconds

    for _ in range(limit):
        response = await client.post(
            "/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}
        )
        assert response.status_code == 401

    blocked = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}
    )
    assert blocked.status_code == 429
    assert "retry-after" in blocked.headers


async def test_successful_login_clears_the_rate_limit_counter(client):
    for _ in range(login_limiter.max_events - 1):
        await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})

    good = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert good.status_code == 200

    # The counter reset, so a fresh run of failures is allowed rather than 429 immediately.
    retry = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert retry.status_code == 401


async def test_me_requires_authentication(client):
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_me_returns_the_signed_in_admin(admin_client):
    response = await admin_client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == ADMIN_EMAIL


async def test_logout_clears_the_session(admin_client):
    assert (await admin_client.post("/api/auth/logout")).status_code == 204
    assert (await admin_client.get("/api/auth/me")).status_code == 401


async def test_garbage_token_is_rejected(client):
    client.cookies.set(SESSION_COOKIE, "not-a-real-jwt")
    assert (await client.get("/api/auth/me")).status_code == 401


@pytest.mark.parametrize(
    "path",
    [
        "/api/admin/projects",
        "/api/admin/experience",
        "/api/admin/posts",
        "/api/admin/messages",
        "/api/admin/settings",
        "/api/admin/media",
        "/api/admin/analytics",
    ],
)
async def test_admin_routes_reject_anonymous_requests(client, path):
    assert (await client.get(path)).status_code == 401


async def test_password_change_requires_the_current_password(admin_client):
    response = await admin_client.post(
        "/api/auth/password",
        json={"current_password": "wrong", "new_password": "a-brand-new-password"},
    )
    assert response.status_code == 400


async def test_password_change_updates_the_credential(admin_client):
    new_password = "a-much-better-password-1"

    changed = await admin_client.post(
        "/api/auth/password",
        json={"current_password": ADMIN_PASSWORD, "new_password": new_password},
    )
    assert changed.status_code == 200

    await admin_client.post("/api/auth/logout")

    assert (
        await admin_client.post(
            "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
    ).status_code == 401
    assert (
        await admin_client.post(
            "/api/auth/login", json={"email": ADMIN_EMAIL, "password": new_password}
        )
    ).status_code == 200


def test_password_hashing_round_trip():
    hashed = hash_password("correct horse battery staple")
    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong", hashed)


def test_overlong_passwords_are_rejected_rather_than_truncated():
    """bcrypt ignores bytes past 72; without a guard two long passwords would collide."""
    from app.core.security import PasswordTooLongError

    with pytest.raises(PasswordTooLongError):
        hash_password("x" * 100)
