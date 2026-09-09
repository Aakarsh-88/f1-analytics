"""
Dashboard data access layer.

Deliberately minimal: totals are plain COUNT(*) queries (not reused
from elsewhere — fetching every Driver/Constructor/Race ORM object just
to len() the list, the way a naive "reuse" might look, would be
strictly worse than a dedicated COUNT query). What IS genuinely reused:
`constructor_repository.get_recent_seasons()` for determining which
seasons belong in the chart, and `race_repository.get_most_recent_race()`
/ `get_race_results()` for the podium — see dashboard_service.py.
"""

from typing import Dict, List

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.race import Race
from app.models.season import Season


def get_total_races(db: Session) -> int:
    return db.execute(select(func.count()).select_from(Race)).scalar_one()


def get_total_drivers(db: Session) -> int:
    return db.execute(select(func.count()).select_from(Driver)).scalar_one()


def get_total_constructors(db: Session) -> int:
    return db.execute(select(func.count()).select_from(Constructor)).scalar_one()


def get_total_seasons(db: Session) -> int:
    return db.execute(select(func.count()).select_from(Season)).scalar_one()


def get_race_counts_by_season(db: Session, years: List[int]) -> Dict[int, int]:
    """Race count per year, for a given set of years. Years with zero
    races simply won't appear in the result — the caller fills 0."""
    if not years:
        return {}
    rows = db.execute(
        select(Race.year, func.count()).where(Race.year.in_(years)).group_by(Race.year)
    ).all()
    return {year: count for year, count in rows}
