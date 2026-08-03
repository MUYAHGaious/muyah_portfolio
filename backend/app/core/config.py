"""Application settings, loaded from the environment."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: Literal["dev", "test", "prod"] = "dev"

    # Database — asyncpg in production, aiosqlite under test.
    database_url: str = "postgresql+asyncpg://portfolio:portfolio@localhost:5432/portfolio"

    # Signs JWTs and salts the analytics visitor hash. Must be overridden in production.
    secret_key: str = "dev-only-insecure-key-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # Admin account seeded on first startup only.
    admin_email: str = "admin@example.com"
    admin_password: str = "change-me-immediately"

    # Origin allowed by CORS and used to build absolute URLs.
    site_origin: str = "http://localhost:3000"

    # Outbound mail for contact-form notifications. Blank host disables sending;
    # messages are still persisted, so nothing is lost.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@example.com"
    smtp_starttls: bool = True
    contact_to_email: str = "admin@example.com"

    upload_dir: str = "/srv/uploads"
    max_upload_bytes: int = 5 * 1024 * 1024

    # Rate limits: (max attempts, window in seconds)
    login_rate_limit: tuple[int, int] = (5, 15 * 60)
    contact_rate_limit: tuple[int, int] = (3, 60 * 60)

    @property
    def cookie_secure(self) -> bool:
        """Only send the session cookie over HTTPS outside local development."""
        return self.env == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
