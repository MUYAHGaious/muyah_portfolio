"""Read-only endpoints for the public site. Unpublished records are never exposed."""

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.core.deps import DbSession
from app.models import (
    SINGLETON_ID,
    Experience,
    Post,
    Project,
    Service,
    SiteSettings,
    Testimonial,
)
from app.schemas.content import (
    ExperienceOut,
    PostListOut,
    PostOut,
    ProjectOut,
    SettingsOut,
)
from app.schemas.service import ServiceOut, TestimonialOut

router = APIRouter(prefix="/api", tags=["public"])

MAX_PER_PAGE = 50


@router.get("/projects", response_model=list[ProjectOut])
async def list_projects(
    db: DbSession,
    category: str | None = Query(default=None, max_length=100),
) -> list[Project]:
    query = select(Project).where(Project.published.is_(True))
    if category:
        query = query.where(Project.category == category)
    query = query.order_by(Project.sort_order.asc(), Project.created_at.desc())
    return list(await db.scalars(query))


@router.get("/projects/{slug}", response_model=ProjectOut)
async def get_project(slug: str, db: DbSession) -> Project:
    project = await db.scalar(
        select(Project).where(Project.slug == slug, Project.published.is_(True))
    )
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project


@router.get("/experience", response_model=list[ExperienceOut])
async def list_experience(db: DbSession) -> list[Experience]:
    query = (
        select(Experience)
        .where(Experience.published.is_(True))
        # Current roles (null end_date) first, then most recent.
        .order_by(
            Experience.sort_order.asc(),
            Experience.end_date.is_(None).desc(),
            Experience.start_date.desc(),
        )
    )
    return list(await db.scalars(query))


@router.get("/posts", response_model=PostListOut)
async def list_posts(
    db: DbSession,
    tag: str | None = Query(default=None, max_length=50),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=MAX_PER_PAGE),
) -> PostListOut:
    ordering = (Post.published_at.desc().nulls_last(), Post.id.desc())

    if tag:
        # Tags live in a JSON column. Rather than reach for a dialect-specific
        # containment operator, load the published set and filter in Python — the
        # scale of a personal blog makes this free, and it keeps SQLite tests honest.
        wanted = tag.strip().lower()
        matching = [
            post
            for post in await db.scalars(
                select(Post).where(Post.published.is_(True)).order_by(*ordering)
            )
            if wanted in post.tags
        ]
        total = len(matching)
        start = (page - 1) * per_page
        rows = matching[start : start + per_page]
    else:
        total = (
            await db.scalar(
                select(func.count()).select_from(Post).where(Post.published.is_(True))
            )
            or 0
        )
        rows = list(
            await db.scalars(
                select(Post)
                .where(Post.published.is_(True))
                .order_by(*ordering)
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
        )

    return PostListOut.model_validate(
        {"items": rows, "total": total, "page": page, "per_page": per_page}
    )


@router.get("/posts/{slug}", response_model=PostOut)
async def get_post(slug: str, db: DbSession) -> Post:
    post = await db.scalar(select(Post).where(Post.slug == slug, Post.published.is_(True)))
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    return post


@router.get("/services", response_model=list[ServiceOut])
async def list_services(db: DbSession) -> list[Service]:
    return list(
        await db.scalars(
            select(Service)
            .where(Service.published.is_(True))
            .order_by(Service.sort_order.asc(), Service.id.asc())
        )
    )


@router.get("/testimonials", response_model=list[TestimonialOut])
async def list_testimonials(db: DbSession) -> list[Testimonial]:
    return list(
        await db.scalars(
            select(Testimonial)
            .where(Testimonial.published.is_(True))
            .order_by(Testimonial.sort_order.asc(), Testimonial.id.asc())
        )
    )


@router.get("/settings", response_model=SettingsOut)
async def get_settings(db: DbSession) -> SiteSettings:
    row = await db.get(SiteSettings, SINGLETON_ID)
    if row is None:
        # Seeding guarantees this row, so its absence means the database was not
        # migrated — surface it rather than inventing an empty response.
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Site settings not initialised")
    return row
