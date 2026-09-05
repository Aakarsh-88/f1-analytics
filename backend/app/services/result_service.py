"""Result business logic layer."""

from typing import Optional

from sqlalchemy.orm import Session

from app.repositories import result_repository
from app.utils.pagination import PaginatedResponse, PaginationParams


def _result_row_dict(result, race, driver, constructor, status) -> dict:
    return {
        "race_id": race.race_id,
        "race_name": race.name,
        "season": race.year,
        "round": race.round,
        "driver_name": driver.full_name,
        "driver_ref": driver.driver_ref,
        "constructor_name": constructor.name,
        "constructor_ref": constructor.constructor_ref,
        "grid": result.grid,
        "position": result.position,
        "position_text": result.position_text or "",
        "points": float(result.points),
        "laps": result.laps,
        "status": status.status,
        "fastest_lap_time": result.fastest_lap_time,
    }


def list_results(
    db: Session,
    driver_ref: Optional[str],
    constructor_ref: Optional[str],
    season: Optional[int],
    race_id: Optional[int],
    pagination: PaginationParams,
) -> PaginatedResponse:
    rows, total = result_repository.list_results(db, driver_ref, constructor_ref, season, race_id, pagination)

    items = [
        _result_row_dict(result, race, driver, constructor, status)
        for result, race, driver, constructor, status in rows
    ]

    return PaginatedResponse.build(items=items, total=total, pagination=pagination)
