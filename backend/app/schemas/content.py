"""Request and response schemas for projects, experience, posts, and settings.

Each entity has three shapes:
  *Out     — what the public site receives
  *Create  — required fields for a new record
  *Update  — every field optional, for PATCH
"""

from datetime import date, datetime
from typing import Annotated, Any

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ORMModel, slugify
from app.schemas.media import MediaOut

Slug = Annotated[str, Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=200)]


# --------------------------------------------------------------------------- project


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    summary: str = Field(default="", max_length=500)
    body_md: str = ""
    year: int | None = Field(default=None, ge=1970, le=2100)
    role: str = Field(default="", max_length=200)
    category: str = Field(default="", max_length=100)
    tech: list[str] = Field(default_factory=list)
    links: dict[str, str] = Field(default_factory=dict)
    cover_image_id: int | None = None
    sort_order: int = 0
    published: bool = False

    @field_validator("tech")
    @classmethod
    def _limit_tech(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item.strip()][:20]


class ProjectCreate(ProjectBase):
    slug: Slug | None = None

    def resolved_slug(self) -> str:
        return self.slug or slugify(self.title)


class ProjectUpdate(BaseModel):
    slug: Slug | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    summary: str | None = Field(default=None, max_length=500)
    body_md: str | None = None
    year: int | None = Field(default=None, ge=1970, le=2100)
    role: str | None = Field(default=None, max_length=200)
    category: str | None = Field(default=None, max_length=100)
    tech: list[str] | None = None
    links: dict[str, str] | None = None
    cover_image_id: int | None = None
    sort_order: int | None = None
    published: bool | None = None


class ProjectOut(ORMModel):
    id: int
    slug: str
    title: str
    summary: str
    body_md: str
    year: int | None
    role: str
    category: str
    tech: list[str]
    links: dict[str, Any]
    cover_image: MediaOut | None
    sort_order: int
    published: bool
    created_at: datetime


# ------------------------------------------------------------------------ experience


class ExperienceBase(BaseModel):
    role: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    location: str = Field(default="", max_length=200)
    start_date: date
    end_date: date | None = None
    summary: str = ""
    highlights: list[str] = Field(default_factory=list)
    sort_order: int = 0
    published: bool = True

    @field_validator("end_date")
    @classmethod
    def _end_after_start(cls, value: date | None, info) -> date | None:
        start = info.data.get("start_date")
        if value and start and value < start:
            raise ValueError("end_date cannot be before start_date")
        return value


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    role: str | None = Field(default=None, min_length=1, max_length=200)
    company: str | None = Field(default=None, min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    summary: str | None = None
    highlights: list[str] | None = None
    sort_order: int | None = None
    published: bool | None = None


class ExperienceOut(ORMModel):
    id: int
    role: str
    company: str
    location: str
    start_date: date
    end_date: date | None
    summary: str
    highlights: list[str]
    sort_order: int
    published: bool


# ------------------------------------------------------------------------------ post


class PostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    excerpt: str = Field(default="", max_length=500)
    body_md: str = ""
    tags: list[str] = Field(default_factory=list)
    published: bool = False

    @field_validator("tags")
    @classmethod
    def _normalise_tags(cls, value: list[str]) -> list[str]:
        seen: list[str] = []
        for tag in value:
            cleaned = tag.strip().lower()
            if cleaned and cleaned not in seen:
                seen.append(cleaned)
        return seen[:10]


class PostCreate(PostBase):
    slug: Slug | None = None

    def resolved_slug(self) -> str:
        return self.slug or slugify(self.title)


class PostUpdate(BaseModel):
    slug: Slug | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    excerpt: str | None = Field(default=None, max_length=500)
    body_md: str | None = None
    tags: list[str] | None = None
    published: bool | None = None


class PostOut(ORMModel):
    id: int
    slug: str
    title: str
    excerpt: str
    body_md: str
    tags: list[str]
    published: bool
    published_at: datetime | None
    updated_at: datetime


class PostSummaryOut(ORMModel):
    """List view — omits the body so index pages stay small."""

    id: int
    slug: str
    title: str
    excerpt: str
    tags: list[str]
    published: bool
    published_at: datetime | None


class PostListOut(BaseModel):
    items: list[PostSummaryOut]
    total: int
    page: int
    per_page: int


# -------------------------------------------------------------------------- settings


class SocialLink(BaseModel):
    label: str = Field(min_length=1, max_length=50)
    url: str = Field(min_length=1, max_length=500)


class SettingsUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    greeting: str | None = Field(default=None, max_length=100)
    tagline: str | None = Field(default=None, max_length=300)
    bio_md: str | None = None
    location: str | None = Field(default=None, max_length=200)
    email: str | None = Field(default=None, max_length=255)
    socials: list[SocialLink] | None = None
    resume_media_id: int | None = None
    avatar_id: int | None = None


class SettingsOut(ORMModel):
    name: str
    greeting: str
    tagline: str
    bio_md: str
    location: str
    email: str
    socials: list[dict[str, Any]]
    resume_media: MediaOut | None
    avatar: MediaOut | None
