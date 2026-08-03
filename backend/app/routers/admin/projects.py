from fastapi import APIRouter, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models import Project
from app.routers.admin._helpers import apply_updates, ensure_slug_available, get_or_404
from app.schemas.content import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["admin:projects"])


@router.get("", response_model=list[ProjectOut])
async def list_all(user: CurrentUser, db: DbSession) -> list[Project]:
    """Every project, published or not — the admin list must show drafts."""
    return list(
        await db.scalars(
            select(Project).order_by(Project.sort_order.asc(), Project.created_at.desc())
        )
    )


@router.get("/{project_id}", response_model=ProjectOut)
async def get_one(project_id: int, user: CurrentUser, db: DbSession) -> Project:
    return await get_or_404(db, Project, project_id, "Project")


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create(payload: ProjectCreate, user: CurrentUser, db: DbSession) -> Project:
    slug = payload.resolved_slug()
    await ensure_slug_available(db, Project, slug)

    project = Project(**payload.model_dump(exclude={"slug"}), slug=slug)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
async def update(
    project_id: int, payload: ProjectUpdate, user: CurrentUser, db: DbSession
) -> Project:
    project = await get_or_404(db, Project, project_id, "Project")
    if payload.slug is not None:
        await ensure_slug_available(db, Project, payload.slug, exclude_id=project_id)

    apply_updates(project, payload)
    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(project_id: int, user: CurrentUser, db: DbSession) -> None:
    project = await get_or_404(db, Project, project_id, "Project")
    await db.delete(project)
    await db.commit()
