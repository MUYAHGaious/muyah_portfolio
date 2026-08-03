"""Login, logout, session introspection, and password change."""

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import SESSION_COOKIE, ClientIP, CurrentUser, DbSession
from app.core.ratelimit import RateLimiter
from app.core.security import create_access_token, hash_password, verify_password
from app.models import AdminUser
from app.schemas.auth import LoginRequest, PasswordChangeRequest, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

login_limiter = RateLimiter(*settings.login_rate_limit)


def _set_session_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=create_access_token(str(user_id)),
        max_age=settings.jwt_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response, db: DbSession, ip: ClientIP) -> AdminUser:
    if not login_limiter.check(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Try again later.",
            headers={"Retry-After": str(login_limiter.retry_after(ip))},
        )

    user = await db.scalar(select(AdminUser).where(AdminUser.email == payload.email))

    # Same response for "no such user" and "wrong password" so the endpoint cannot
    # be used to discover whether an address is registered.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    login_limiter.reset(ip)
    _set_session_cookie(response, user.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> AdminUser:
    return user


@router.post("/password", response_model=UserOut)
async def change_password(
    payload: PasswordChangeRequest,
    user: CurrentUser,
    response: Response,
    db: DbSession,
) -> AdminUser:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    user.password_hash = hash_password(payload.new_password)
    await db.commit()
    await db.refresh(user)

    # Re-issue the cookie so the session survives the change.
    _set_session_cookie(response, user.id)
    return user
