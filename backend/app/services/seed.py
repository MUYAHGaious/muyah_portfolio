"""First-run bootstrapping: the admin account and the settings singleton.

Both operations are idempotent, so this is safe to run on every startup.
"""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models import SINGLETON_ID, AdminUser, SiteSettings

logger = logging.getLogger(__name__)

INSECURE_DEFAULT_PASSWORD = "change-me-immediately"


async def ensure_admin_user(db: AsyncSession) -> AdminUser:
    """Create the admin account from the environment if no account exists yet.

    An existing account is never modified — changing ADMIN_PASSWORD in the
    environment after first run has no effect, so a leaked env file cannot be
    used to silently reset the password by restarting the container.
    """
    existing = await db.scalar(select(AdminUser).limit(1))
    if existing is not None:
        return existing

    if settings.admin_password == INSECURE_DEFAULT_PASSWORD and settings.env == "prod":
        raise RuntimeError(
            "ADMIN_PASSWORD is still the default value. Set a real password before "
            "starting in production."
        )

    user = AdminUser(
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("Seeded admin account for %s", settings.admin_email)
    return user


async def ensure_site_settings(db: AsyncSession) -> SiteSettings:
    """Guarantee the singleton settings row exists so reads never 404."""
    existing = await db.get(SiteSettings, SINGLETON_ID)
    if existing is not None:
        return existing

    row = SiteSettings(id=SINGLETON_ID)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row
