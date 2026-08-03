"""Test fixtures.

The suite runs against in-memory SQLite so it needs no database server. No query
in the application uses a Postgres-specific operator, which is what makes that
substitution safe; the same suite is run against real Postgres inside the
container during integration verification.

Environment variables are set before any `app.*` import because settings are read
once, at module import.
"""

import os
import tempfile

os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-used-anywhere-real")
# Not a .local/.test address: email-validator rejects special-use domains, so a
# fixture using one would fail validation before reaching any real assertion.
os.environ.setdefault("ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("ADMIN_PASSWORD", "test-password-123456")
os.environ.setdefault("SITE_ORIGIN", "http://testserver")
os.environ.setdefault("UPLOAD_DIR", tempfile.mkdtemp(prefix="portfolio-uploads-"))

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.db import Base, SessionFactory, engine  # noqa: E402
from app.main import create_app  # noqa: E402
from app.routers.auth import login_limiter  # noqa: E402
from app.routers.contact import contact_limiter  # noqa: E402
from app.services.seed import ensure_admin_user, ensure_site_settings  # noqa: E402

ADMIN_EMAIL = settings.admin_email
ADMIN_PASSWORD = settings.admin_password


@pytest.fixture
async def db():
    """A clean schema per test, plus the rows startup would normally seed."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    # Rate limiters are process-global; without this a test that exhausts the login
    # limit would break every test that runs after it.
    login_limiter.reset()
    contact_limiter.reset()

    async with SessionFactory() as session:
        await ensure_admin_user(session)
        await ensure_site_settings(session)
        yield session


@pytest.fixture
async def client(db):
    """An unauthenticated HTTP client bound to the app."""
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http:
        yield http


@pytest.fixture
async def admin_client(client):
    """A client holding a valid session cookie."""
    response = await client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, response.text
    return client


@pytest.fixture
def upload_dir(tmp_path, monkeypatch):
    """Redirect uploads to a per-test directory."""
    monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
    return tmp_path


def png_bytes(width: int = 800, height: int = 600) -> bytes:
    """A real PNG, so upload validation is exercised rather than mocked."""
    import io

    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (width, height), (200, 120, 60)).save(buffer, format="PNG")
    return buffer.getvalue()
