"""Shared FastAPI dependencies: authentication and client-IP resolution."""

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_access_token
from app.models import AdminUser

SESSION_COOKIE = "session"

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    session: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> AdminUser:
    """Resolve the signed-in admin, or raise 401."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )
    if not session:
        raise unauthorized

    subject = decode_access_token(session)
    if subject is None:
        raise unauthorized

    try:
        user_id = int(subject)
    except ValueError:
        raise unauthorized from None

    user = await db.get(AdminUser, user_id)
    if user is None:
        # Token is validly signed but the account is gone.
        raise unauthorized
    return user


CurrentUser = Annotated[AdminUser, Depends(get_current_user)]


def client_ip(request: Request) -> str:
    """The caller's IP.

    Caddy sets X-Forwarded-For and, being the only ingress, is the sole writer of
    that header — so the left-most entry is the real client. If the app is ever
    put behind an additional proxy this needs revisiting.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


ClientIP = Annotated[str, Depends(client_ip)]
