"""FastAPI application factory and startup wiring."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.db import SessionFactory, engine
from app.services.seed import ensure_admin_user, ensure_site_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema is already in place: the container entrypoint runs
    # `alembic upgrade head` before uvicorn starts. This only inserts rows.
    async with SessionFactory() as db:
        await ensure_admin_user(db)
        await ensure_site_settings(db)
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Portfolio API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/api/docs" if settings.env != "prod" else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if settings.env != "prod" else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.site_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Caddy serves /uploads straight from the shared volume in production, so
    # these bytes normally never touch Python. The mount exists so that
    # `npm run dev` against a bare API still resolves images, and so a
    # misconfigured proxy degrades to "slower" rather than "broken".
    upload_root = Path(settings.upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_root), name="uploads")

    from app.routers import admin, analytics, auth, contact, media, public

    app.include_router(auth.router)
    app.include_router(public.router)
    app.include_router(contact.router)
    app.include_router(analytics.router)
    app.include_router(media.router)
    app.include_router(admin.router)

    @app.get("/api/health", tags=["health"])
    async def health() -> dict[str, str]:
        """Liveness plus a real database round-trip, for the container healthcheck."""
        async with SessionFactory() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "ok"}

    return app


app = create_app()
