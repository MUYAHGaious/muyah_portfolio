from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ORMModel
from app.schemas.media import MediaOut


class ServiceBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    blurb: str = Field(default="", max_length=300)
    body_md: str = ""
    points: list[str] = Field(default_factory=list)
    image_id: int | None = None
    featured: bool = True
    sort_order: int = 0
    published: bool = True

    @field_validator("points")
    @classmethod
    def _clean(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item.strip()][:10]


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    blurb: str | None = Field(default=None, max_length=300)
    body_md: str | None = None
    points: list[str] | None = None
    image_id: int | None = None
    featured: bool | None = None
    sort_order: int | None = None
    published: bool | None = None


class ServiceOut(ORMModel):
    id: int
    title: str
    blurb: str
    body_md: str
    points: list[str]
    image: MediaOut | None
    featured: bool
    sort_order: int
    published: bool


class TestimonialBase(BaseModel):
    quote: str = Field(min_length=1, max_length=2000)
    author: str = Field(min_length=1, max_length=120)
    role: str = Field(default="", max_length=200)
    avatar_id: int | None = None
    sort_order: int = 0
    published: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    quote: str | None = Field(default=None, min_length=1, max_length=2000)
    author: str | None = Field(default=None, min_length=1, max_length=120)
    role: str | None = Field(default=None, max_length=200)
    avatar_id: int | None = None
    sort_order: int | None = None
    published: bool | None = None


class TestimonialOut(ORMModel):
    id: int
    quote: str
    author: str
    role: str
    avatar: MediaOut | None
    sort_order: int
    published: bool
