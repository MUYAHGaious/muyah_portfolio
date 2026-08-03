from fastapi import APIRouter, status
from sqlalchemy import select

from app.core.db import utcnow
from app.core.deps import CurrentUser, DbSession
from app.models import Post
from app.routers.admin._helpers import apply_updates, ensure_slug_available, get_or_404
from app.schemas.content import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/posts", tags=["admin:posts"])


@router.get("", response_model=list[PostOut])
async def list_all(user: CurrentUser, db: DbSession) -> list[Post]:
    return list(await db.scalars(select(Post).order_by(Post.updated_at.desc())))


@router.get("/{post_id}", response_model=PostOut)
async def get_one(post_id: int, user: CurrentUser, db: DbSession) -> Post:
    return await get_or_404(db, Post, post_id, "Post")


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create(payload: PostCreate, user: CurrentUser, db: DbSession) -> Post:
    slug = payload.resolved_slug()
    await ensure_slug_available(db, Post, slug)

    post = Post(**payload.model_dump(exclude={"slug"}), slug=slug)
    # published_at is set once, the first time a post goes live, and preserved
    # thereafter — unpublishing and republishing must not rewrite history.
    if post.published:
        post.published_at = utcnow()

    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=PostOut)
async def update(post_id: int, payload: PostUpdate, user: CurrentUser, db: DbSession) -> Post:
    post = await get_or_404(db, Post, post_id, "Post")
    if payload.slug is not None:
        await ensure_slug_available(db, Post, payload.slug, exclude_id=post_id)

    apply_updates(post, payload)
    if post.published and post.published_at is None:
        post.published_at = utcnow()

    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(post_id: int, user: CurrentUser, db: DbSession) -> None:
    post = await get_or_404(db, Post, post_id, "Post")
    await db.delete(post)
    await db.commit()
