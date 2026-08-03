"""Password hashing, JWT issue/verify, and privacy-preserving hashes."""

import hashlib
import hmac
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

# bcrypt silently truncates anything past 72 bytes, which would make two different
# long passwords interchangeable. Reject them at the edge instead.
MAX_PASSWORD_BYTES = 72


class PasswordTooLongError(ValueError):
    pass


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise PasswordTooLongError(f"Password must be at most {MAX_PASSWORD_BYTES} bytes")
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        return False
    try:
        return bcrypt.checkpw(encoded, password_hash.encode("utf-8"))
    except ValueError:
        # Malformed hash in the database — treat as a failed login, never a 500.
        return False


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_expire_days),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | None:
    """Return the token subject, or None if the token is invalid or expired."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None


def _daily_salt(when: datetime | None = None) -> str:
    """A salt that changes every UTC day.

    Rotating it means a visitor hash stops matching after 24 hours, so views cannot
    be stitched into a profile over time.
    """
    day = (when or datetime.now(timezone.utc)).strftime("%Y-%m-%d")
    return f"{settings.secret_key}:{day}"


def visitor_hash(ip: str, user_agent: str, when: datetime | None = None) -> str:
    """Identify a visitor for today's unique count only. Not reversible to an IP."""
    return hmac.new(
        _daily_salt(when).encode("utf-8"),
        f"{ip}|{user_agent}".encode(),
        hashlib.sha256,
    ).hexdigest()


def stable_ip_hash(ip: str) -> str:
    """Hash an IP for rate limiting. Stable across days, still not reversible."""
    return hmac.new(settings.secret_key.encode("utf-8"), ip.encode("utf-8"), hashlib.sha256).hexdigest()
