"""Outbound mail for contact-form notifications.

Sending is best-effort by design: the caller persists the message first, so a
failure here is logged and swallowed rather than surfaced to the visitor. Losing a
lead because an SMTP host was briefly unreachable would be worse than a delayed
notification.
"""

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_notification(name: str, email: str, subject: str, body: str) -> EmailMessage:
    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = settings.contact_to_email
    message["Subject"] = f"Portfolio contact: {subject or name}"
    # Replying to the notification goes straight back to the visitor.
    message["Reply-To"] = email
    message.set_content(
        f"From: {name} <{email}>\n"
        f"Subject: {subject or '(none)'}\n"
        f"\n"
        f"{body}\n"
    )
    return message


async def send_contact_notification(name: str, email: str, subject: str, body: str) -> bool:
    """Send the notification. Returns whether it was delivered to the SMTP server."""
    if not settings.smtp_host:
        logger.info("SMTP not configured; contact message stored without notification")
        return False

    try:
        await aiosmtplib.send(
            _build_notification(name, email, subject, body),
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_password or None,
            start_tls=settings.smtp_starttls,
            timeout=10,
        )
        return True
    except (aiosmtplib.SMTPException, OSError, TimeoutError):
        # Deliberately broad-but-bounded: any transport failure must not fail the request.
        logger.exception("Failed to send contact notification; message is still stored")
        return False
