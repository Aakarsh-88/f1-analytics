"""
Constructor data access layer.

Mirrors driver_repository.py's approach: aggregate stats computed via
SQL (GROUP BY / CASE), not pulled into Python row-by-row.
"championships" uses the same "held P1 at the season's LAST race"
definition as drivers, just against `constructor_standings` instead of
`driver_standings`.
"""

from typing import List, Optional, Sequence, Tuple

from sqlalchemy import Select, and_, case, func, or_, select
from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.models.constructor_standing import ConstructorStanding
from app.models.race import Race
from app.models.result import Result
from app.utils.pagination import PaginationParams


def _constructor_stats_subquery():
    """One row per constructor_id: wins, podiums."""
    return (
        select(
            Result.constructor_id.label("constructor_id"),
            func.sum(case((Result.position == 1, 1), else_=0)).label("wins"),
            func.sum(case((Result.position.in_([1, 2, 3]), 1), else_=0)).label("podiums"),
        )
        .group_by(Result.constructor_id)
        .subquery()
    )


def _constructor_championships_subquery():
    """One row per constructor_id who has ever finished P1 in a season's final standings."""
    last_round_per_year = (
        select(Race.year, func.max(Race.round).label("max_round")).group_by(Race.year).subquery()
    )
    last_race_per_year = (
        select(Race.race_id, Race.year)
        .join(
            last_round_per_year,
            and_(
                Race.year == last_round_per_year.c.year,
                Race.round == last_round_per_year.c.max_round,
            ),
        )
        .subquery()
    )
    return (
        select(
            ConstructorStanding.constructor_id.label("constructor_id"),
            func.count().label("championships"),
        )
        .join(last_race_per_year, ConstructorStanding.race_id == last_race_per_year.c.race_id)
        .where(ConstructorStanding.position == 1)
        .group_by(ConstructorStanding.constructor_id)
        .subquery()
    )


def _first_season_subquery():
    """One row per constructor_id: the earliest season they ever competed in."""
    return (
        select(Result.constructor_id.label("constructor_id"), func.min(Race.year).label("first_season"))
        .join(Race, Race.race_id == Result.race_id)
        .group_by(Result.constructor_id)
        .subquery()
    )


def list_constructors_with_stats(
    db: Session, search: Optional[str], pagination: PaginationParams
) -> Tuple[Sequence, int]:
    """
    Returns (rows, total) where each row is
    (Constructor, wins, podiums, championships, first_season).
    Constructors with zero results (wins/podiums/first_season) are
    excluded via inner join on the first_season subquery — a
    constructor that has never actually raced has no meaningful "first
    season" and shouldn't appear in this list at all.
    """
    stats = _constructor_stats_subquery()
    champs = _constructor_championships_subquery()
    first_season = _first_season_subquery()

    stmt: Select = (
        select(
            Constructor,
            func.coalesce(stats.c.wins, 0).label("wins"),
            func.coalesce(stats.c.podiums, 0).label("podiums"),
            func.coalesce(champs.c.championships, 0).label("championships"),
            first_season.c.first_season,
        )
        .join(first_season, first_season.c.constructor_id == Constructor.constructor_id)
        .outerjoin(stats, stats.c.constructor_id == Constructor.constructor_id)
        .outerjoin(champs, champs.c.constructor_id == Constructor.constructor_id)
    )

    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Constructor.name).like(pattern),
                func.lower(Constructor.nationality).like(pattern),
            )
        )

    stmt = stmt.order_by(Constructor.name)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    paged_stmt = stmt.offset(pagination.offset).limit(pagination.page_size)
    rows = db.execute(paged_stmt).all()

    return rows, total


def get_recent_seasons(db: Session, count: int) -> List[int]:
    """The most recent N distinct seasons present in the data at all (not constructor-specific)."""
    rows = db.execute(select(Race.year).distinct().order_by(Race.year.desc()).limit(count)).all()
    return sorted(year for (year,) in rows)


def get_wins_by_season_for_years(db: Session, constructor_id: int, years: List[int]) -> List[dict]:
    """
    Wins per season for a fixed list of years, with 0 filled in for any
    year the constructor didn't win at all — the frontend's trend
    sparkline expects one point per requested season, never a gap.
    """
    if not years:
        return []

    rows = db.execute(
        select(Race.year, func.sum(case((Result.position == 1, 1), else_=0)).label("wins"))
        .join(Result, Result.race_id == Race.race_id)
        .where(Result.constructor_id == constructor_id, Race.year.in_(years))
        .group_by(Race.year)
    ).all()

    wins_by_year = {year: (wins or 0) for year, wins in rows}
    return [{"season": year, "wins": wins_by_year.get(year, 0)} for year in years]
