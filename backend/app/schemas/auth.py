from pydantic import BaseModel, EmailStr, Field

from app.core.security import MAX_PASSWORD_BYTES
from app.schemas.common import ORMModel


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=MAX_PASSWORD_BYTES)


class UserOut(ORMModel):
    id: int
    email: str


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=MAX_PASSWORD_BYTES)
    new_password: str = Field(min_length=12, max_length=MAX_PASSWORD_BYTES)
