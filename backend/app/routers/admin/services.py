from fastapi import APIRouter, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models import Service, Testimonial
from app.routers.admin._helpers import apply_updates, get_or_404
from app.schemas.service import (
    ServiceCreate,
    ServiceOut,
    ServiceUpdate,
    TestimonialCreate,
    TestimonialOut,
    TestimonialUpdate,
)

router = APIRouter(tags=["admin:services"])


# ------------------------------------------------------------------- services


@router.get("/services", response_model=list[ServiceOut])
async def list_services(user: CurrentUser, db: DbSession) -> list[Service]:
    return list(await db.scalars(select(Service).order_by(Service.sort_order.asc(), Service.id)))


@router.post("/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
async def create_service(payload: ServiceCreate, user: CurrentUser, db: DbSession) -> Service:
    service = Service(**payload.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.patch("/services/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int, payload: ServiceUpdate, user: CurrentUser, db: DbSession
) -> Service:
    service = await get_or_404(db, Service, service_id, "Service")
    apply_updates(service, payload)
    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, user: CurrentUser, db: DbSession) -> None:
    service = await get_or_404(db, Service, service_id, "Service")
    await db.delete(service)
    await db.commit()


# --------------------------------------------------------------- testimonials


@router.get("/testimonials", response_model=list[TestimonialOut])
async def list_testimonials(user: CurrentUser, db: DbSession) -> list[Testimonial]:
    return list(
        await db.scalars(select(Testimonial).order_by(Testimonial.sort_order.asc(), Testimonial.id))
    )


@router.post("/testimonials", response_model=TestimonialOut, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    payload: TestimonialCreate, user: CurrentUser, db: DbSession
) -> Testimonial:
    testimonial = Testimonial(**payload.model_dump())
    db.add(testimonial)
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


@router.patch("/testimonials/{testimonial_id}", response_model=TestimonialOut)
async def update_testimonial(
    testimonial_id: int, payload: TestimonialUpdate, user: CurrentUser, db: DbSession
) -> Testimonial:
    testimonial = await get_or_404(db, Testimonial, testimonial_id, "Testimonial")
    apply_updates(testimonial, payload)
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


@router.delete("/testimonials/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(testimonial_id: int, user: CurrentUser, db: DbSession) -> None:
    testimonial = await get_or_404(db, Testimonial, testimonial_id, "Testimonial")
    await db.delete(testimonial)
    await db.commit()
