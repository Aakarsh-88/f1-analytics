"""
Standings API.

    GET /api/v1/standings?season=YYYY - full snapshot: driver standings,
    constructor standings, and points progression for the top 3 drivers.

Defaults to the most recent season with data if `season` is omitted.
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.standings import StandingsData
from app.services import standings_service

router = APIRouter(prefix="/standings", tags=["standings"])


@router.get(
    "",
    response_model=StandingsData,
    summary="Driver standings, constructor standings, and points progression for a season",
)
def get_standings(
    db: DbSession,
    season: Optional[int] = Query(
        default=None, description="Season year; defaults to the most recent season with data"
    ),
) -> dict:
    return standings_service.get_standings_data(db, season)
