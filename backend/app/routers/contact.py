"""Public contact-form endpoint."""

import logging

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.deps import ClientIP, DbSession
from app.core.ratelimit import RateLimiter
from app.core.security import stable_ip_hash
from app.models import Message
from app.schemas.contact import ContactRequest, ContactResponse
from app.services.email import send_contact_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["contact"])

contact_limiter = RateLimiter(*settings.contact_rate_limit)

# A person needs at least a few seconds to type a message; anything faster is scripted.
MIN_FORM_ELAPSED_MS = 2_000


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest, db: DbSession, ip: ClientIP) -> ContactResponse:
    # Bots that fill every field trip the honeypot. Respond with success so the
    # sender learns nothing about why it was dropped.
    if payload.website.strip():
        logger.info("Dropped contact submission: honeypot filled")
        return ContactResponse()

    if 0 < payload.elapsed_ms < MIN_FORM_ELAPSED_MS:
        logger.info("Dropped contact submission: submitted in %dms", payload.elapsed_ms)
        return ContactResponse()

    if not contact_limiter.check(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You've sent several messages recently. Please try again later.",
            headers={"Retry-After": str(contact_limiter.retry_after(ip))},
        )

    message = Message(
        name=payload.name.strip(),
        email=str(payload.email),
        subject=payload.subject.strip(),
        body=payload.message.strip(),
        ip_hash=stable_ip_hash(ip),
    )
    db.add(message)
    await db.commit()

    # Persisted first, so the message survives even if delivery fails.
    await send_contact_notification(message.name, message.email, message.subject, message.body)

    return ContactResponse()
