"""
Races API.

    GET /api/v1/races              - all race summaries
    GET /api/v1/races/{race_id}    - complete detail for one race
"""

from typing import List

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.race import RaceDetail, RaceSummary
from app.services import race_service

router = APIRouter(prefix="/races", tags=["races"])


@router.get(
    "",
    response_model=List[RaceSummary],
    summary="List all races ordered from newest to oldest",
)
def list_races(db: DbSession) -> List[RaceSummary]:
    return race_service.list_races(db)


@router.get(
    "/{race_id}",
    response_model=RaceDetail,
    summary="Get complete details for one race",
)
def get_race(race_id: int, db: DbSession) -> RaceDetail:
    return race_service.get_race_detail(db, race_id)
