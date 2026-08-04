"""
Driver business logic layer.

Routers call these functions and never touch SQLAlchemy directly (see
`api/v1/drivers.py`) — this is the layer that turns raw aggregate rows
from `driver_repository.py` into the exact shapes `schemas/driver.py`
expects, and is where derived-but-not-stored numbers like win
percentage and DNF percentage get computed.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.repositories import driver_repository
from app.utils.exceptions import NotFoundException
from app.utils.pagination import PaginatedResponse, PaginationParams


def _win_percentage(wins: int, total_races: int) -> float:
    if total_races == 0:
        return 0.0
    return round((wins / total_races) * 100, 1)


def _driver_summary_dict(driver: Driver, wins: int, podiums: int, total_races: int, championships: int) -> dict:
    return {
        "driver_id": driver.driver_id,
        "driver_ref": driver.driver_ref,
        "full_name": driver.full_name,
        "code": driver.code,
        "number": driver.number,
        "nationality": driver.nationality,
        "wins": wins,
        "podiums": podiums,
        "championships": championships,
        "win_percentage": _win_percentage(wins, total_races),
    }


def list_drivers(db: Session, search: Optional[str], pagination: PaginationParams) -> PaginatedResponse:
    rows, total = driver_repository.list_drivers_with_stats(db, search, pagination)

    items = [
        _driver_summary_dict(driver, wins, podiums, total_races, championships)
        for driver, wins, podiums, total_races, championships in rows
    ]

    return PaginatedResponse.build(items=items, total=total, pagination=pagination)


def get_driver_detail(db: Session, driver_ref: str) -> dict:
    driver = driver_repository.get_driver_by_ref(db, driver_ref)
    if driver is None:
        raise NotFoundException(f"No driver found with ref '{driver_ref}'", details={"driver_ref": driver_ref})

    stats = driver_repository.get_driver_career_stats(db, driver.driver_id)
    wins_by_season = driver_repository.get_wins_by_season(db, driver.driver_id)

    summary = _driver_summary_dict(
        driver,
        wins=stats["wins"],
        podiums=stats["podiums"],
        total_races=stats["total_races"],
        championships=stats["championships"],
    )

    dnf_percentage = (
        round((stats["dnfs"] / stats["total_races"]) * 100, 1) if stats["total_races"] else 0.0
    )

    return {
        "summary": summary,
        "total_races": stats["total_races"],
        "average_finish": round(stats["avg_finish"], 1),
        "dnf_percentage": dnf_percentage,
        "wins_by_season_chart": wins_by_season,
        "results_breakdown": {
            "wins": stats["wins"],
            "other_podiums": max(stats["podiums"] - stats["wins"], 0),
            "points_finishes": stats["points_finishes"],
            "no_points_finishes": stats["no_points_finishes"],
            "dnfs": stats["dnfs"],
        },
    }
