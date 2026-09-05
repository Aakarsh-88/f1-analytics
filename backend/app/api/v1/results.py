"""
Results API.

    GET /api/v1/results - filterable, paginated results history across all races

Query params are all optional and combine with AND: e.g.
?driverRef=verstappen&season=2023 returns only Verstappen's 2023 results.
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.api.deps import DbSession, Pagination
from app.schemas.result import ResultRow
from app.services import result_service
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/results", tags=["results"])


@router.get(
    "",
    response_model=PaginatedResponse[ResultRow],
    summary="Query race results across all races, filterable by driver, constructor, season, or race",
)
def list_results(
    db: DbSession,
    pagination: Pagination,
    driver_ref: Optional[str] = Query(default=None, alias="driverRef", description="e.g. 'verstappen'"),
    constructor_ref: Optional[str] = Query(default=None, alias="constructorRef", description="e.g. 'red_bull'"),
    season: Optional[int] = Query(default=None, description="e.g. 2023"),
    race_id: Optional[int] = Query(default=None, alias="raceId", description="Restrict to one specific race"),
) -> PaginatedResponse:
    return result_service.list_results(db, driver_ref, constructor_ref, season, race_id, pagination)
