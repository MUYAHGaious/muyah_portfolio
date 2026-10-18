from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.models import SiteSettings
from app.routers.admin._helpers import sent_fields
from app.schemas.content import SettingsOut, SettingsUpdate
from app.services.seed import ensure_site_settings

router = APIRouter(prefix="/settings", tags=["admin:settings"])


@router.get("", response_model=SettingsOut)
async def read_settings(user: CurrentUser, db: DbSession) -> SiteSettings:
    return await ensure_site_settings(db)


@router.patch("", response_model=SettingsOut)
async def update_settings(
    payload: SettingsUpdate, user: CurrentUser, db: DbSession
) -> SiteSettings:
    row = await ensure_site_settings(db)

    for field, value in sent_fields(payload).items():
        setattr(row, field, value)

    await db.commit()
    await db.refresh(row)
    return row
