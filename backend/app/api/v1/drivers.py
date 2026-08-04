"""
Drivers API.

    GET /api/v1/drivers              - paginated, searchable list with career stats
    GET /api/v1/drivers/{driver_ref} - full detail for one driver's profile page

Field names in every response are camelCase (see schemas/base.py) to
match `frontend/src/types/driver.ts` exactly.
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.api.deps import DbSession, Pagination
from app.schemas.driver import DriverDetail, DriverSummary
from app.services import driver_service
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get(
    "",
    response_model=PaginatedResponse[DriverSummary],
    summary="List drivers with career stats, paginated and searchable",
)
def list_drivers(
    db: DbSession,
    pagination: Pagination,
    search: Optional[str] = Query(
        default=None,
        description="Case-insensitive match against forename, surname, nationality, or code",
    ),
) -> PaginatedResponse:
    return driver_service.list_drivers(db, search, pagination)


@router.get(
    "/{driver_ref}",
    response_model=DriverDetail,
    summary="Full career stats and charts for one driver",
)
def get_driver(driver_ref: str, db: DbSession) -> dict:
    return driver_service.get_driver_detail(db, driver_ref)
