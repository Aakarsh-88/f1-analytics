"""
Races API.

    GET /api/v1/races              - all race summaries
    GET /api/v1/races/{race_id}    - complete detail for one race
"""

from typing import List

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.race import RaceDetail, RaceSummary
from app.services import race_service

router = APIRouter(prefix="/races", tags=["races"])


@router.get(
    "",
    response_model=List[RaceSummary],
    response_model_exclude_none=True,
    summary="List races, optionally filtered to a season",
)
def list_races(
    db: DbSession,
    season: int | None = Query(default=None, description="Season year"),
) -> List[RaceSummary]:
    return race_service.list_races(db, season)


@router.get(
    "/{race_id}",
    response_model=RaceDetail,
    summary="Get complete details for one race",
)
def get_race(race_id: int, db: DbSession) -> RaceDetail:
    return race_service.get_race_detail(db, race_id)
