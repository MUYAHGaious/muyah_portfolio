from fastapi import APIRouter, status
from sqlalchemy import func, select

from app.core.db import utcnow
from app.core.deps import CurrentUser, DbSession
from app.models import Message
from app.routers.admin._helpers import get_or_404
from app.schemas.contact import MessageListOut, MessageOut

router = APIRouter(prefix="/messages", tags=["admin:messages"])


@router.get("", response_model=MessageListOut)
async def list_messages(user: CurrentUser, db: DbSession) -> MessageListOut:
    items = list(await db.scalars(select(Message).order_by(Message.created_at.desc())))
    unread = (
        await db.scalar(
            select(func.count()).select_from(Message).where(Message.read_at.is_(None))
        )
        or 0
    )
    return MessageListOut.model_validate(
        {"items": items, "total": len(items), "unread": unread}
    )


@router.patch("/{message_id}/read", response_model=MessageOut)
async def mark_read(message_id: int, user: CurrentUser, db: DbSession) -> Message:
    message = await get_or_404(db, Message, message_id, "Message")
    # Idempotent: re-reading a message keeps the original timestamp.
    if message.read_at is None:
        message.read_at = utcnow()
        await db.commit()
        await db.refresh(message)
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(message_id: int, user: CurrentUser, db: DbSession) -> None:
    message = await get_or_404(db, Message, message_id, "Message")
    await db.delete(message)
    await db.commit()
