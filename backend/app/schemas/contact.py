from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(default="", max_length=300)
    message: str = Field(min_length=10, max_length=10_000)

    # Hidden field: a human never sees it, so anything here means a bot filled the form.
    website: str = ""

    # Milliseconds between the form rendering and submitting. Bots submit instantly.
    elapsed_ms: int = Field(default=0, ge=0)


class ContactResponse(BaseModel):
    ok: bool = True
    message: str = "Thanks — your message has been received."


class MessageOut(ORMModel):
    id: int
    name: str
    email: str
    subject: str
    body: str
    read_at: datetime | None
    created_at: datetime


class MessageListOut(BaseModel):
    items: list[MessageOut]
    total: int
    unread: int
