"""Settings assembly, especially the database URL."""

import pytest
from sqlalchemy.engine import make_url

from app.core.config import Settings

PARTS = {
    "postgres_user": "portfolio",
    "postgres_db": "portfolio",
    "postgres_host": "db",
}


@pytest.fixture(autouse=True)
def _without_database_url(monkeypatch):
    """conftest exports DATABASE_URL for the suite, and an explicit value is
    meant to win — so clear it here to exercise the assembly path."""
    monkeypatch.delenv("DATABASE_URL", raising=False)


@pytest.mark.parametrize(
    "password",
    [
        "simple",
        "with/slash",          # would end the host section
        "with+plus",           # decoded as a space by some parsers
        "with:colon",          # would look like a port
        "with@at",             # would look like the host separator
        "with%percent",        # breaks ConfigParser interpolation
        "aB3/xY+z:q@w%e",      # all of the above
    ],
)
def test_database_url_survives_awkward_passwords(password):
    """A generated password must not be able to corrupt the connection string."""
    settings = Settings(postgres_password=password, **PARTS)
    url = make_url(settings.database_url)

    assert url.password == password
    assert url.host == "db"
    assert url.database == "portfolio"
    assert url.username == "portfolio"


def test_explicit_database_url_wins_over_parts():
    settings = Settings(
        database_url="postgresql+asyncpg://someone:else@elsewhere:5432/other",
        postgres_password="ignored",
        **PARTS,
    )

    assert make_url(settings.database_url).host == "elsewhere"


def test_url_is_left_alone_when_no_postgres_password_is_given():
    """The SQLite default used by the test suite must not be overwritten."""
    settings = Settings(database_url="sqlite+aiosqlite:///:memory:")

    assert settings.database_url == "sqlite+aiosqlite:///:memory:"


def test_cookies_are_only_marked_secure_in_production():
    assert Settings(env="prod").cookie_secure is True
    assert Settings(env="dev").cookie_secure is False
