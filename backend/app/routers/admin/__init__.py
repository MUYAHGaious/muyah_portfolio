"""Authenticated admin API.

Every sub-router depends on `CurrentUser`, so an unauthenticated request to any
path under /api/admin returns 401 before reaching a handler.
"""

from fastapi import APIRouter

from app.routers.admin import experience, messages, posts, projects, services, settings

router = APIRouter(prefix="/api/admin")

router.include_router(projects.router)
router.include_router(experience.router)
router.include_router(posts.router)
router.include_router(messages.router)
router.include_router(services.router)
router.include_router(settings.router)

__all__ = ["router"]
