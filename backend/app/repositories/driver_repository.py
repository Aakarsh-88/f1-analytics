"""
Driver data access layer.

Every career stat here (wins, podiums, championships, DNFs, average
finish) is computed via SQL aggregation — GROUP BY / CASE / AVG — rather
than pulling every result row into Python and summing there. For a
driver with 300+ career races this is the difference between one
indexed aggregate query and hundreds of rows crossing the DB boundary
per driver.

"Championships" specifically means: the driver held P1 in
`driver_standings` at the LAST race of that season (found via a
max(round) per year subquery) — not merely leading the standings at
some point mid-season.
"""

from typing import List, Optional, Sequence, Tuple

from sqlalchemy import Select, and_, case, func, or_, select
from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.models.driver_standing import DriverStanding
from app.models.race import Race
from app.models.result import Result
from app.utils.pagination import PaginationParams


def _career_stats_subquery():
    """One row per driver_id: total_races, wins, podiums, dnfs, avg_finish."""
    return (
        select(
            Result.driver_id.label("driver_id"),
            func.count().label("total_races"),
            func.sum(case((Result.position == 1, 1), else_=0)).label("wins"),
            func.sum(case((Result.position.in_([1, 2, 3]), 1), else_=0)).label("podiums"),
            func.sum(case((Result.position.is_(None), 1), else_=0)).label("dnfs"),
            # No else_ clause is intentional: SQL AVG() ignores NULLs, so
            # DNF rows (position IS NULL) correctly fall out of the
            # average instead of needing to be filtered separately.
            func.avg(case((Result.position.isnot(None), Result.position))).label("avg_finish"),
        )
        .group_by(Result.driver_id)
        .subquery()
    )


def _championships_subquery():
    """One row per driver_id who has ever finished P1 in a season's final standings."""
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
            DriverStanding.driver_id.label("driver_id"),
            func.count().label("championships"),
        )
        .join(last_race_per_year, DriverStanding.race_id == last_race_per_year.c.race_id)
        .where(DriverStanding.position == 1)
        .group_by(DriverStanding.driver_id)
        .subquery()
    )


def list_drivers_with_stats(
    db: Session, search: Optional[str], pagination: PaginationParams
) -> Tuple[Sequence, int]:
    """
    Returns (rows, total) where each row is
    (Driver, wins, podiums, total_races, championships) — outer-joined
    against drivers who have zero results yet (coalesced to 0) rather
    than silently excluding them.
    """
    stats = _career_stats_subquery()
    champs = _championships_subquery()

    stmt: Select = (
        select(
            Driver,
            func.coalesce(stats.c.wins, 0).label("wins"),
            func.coalesce(stats.c.podiums, 0).label("podiums"),
            func.coalesce(stats.c.total_races, 0).label("total_races"),
            func.coalesce(champs.c.championships, 0).label("championships"),
        )
        .outerjoin(stats, stats.c.driver_id == Driver.driver_id)
        .outerjoin(champs, champs.c.driver_id == Driver.driver_id)
    )

    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Driver.forename).like(pattern),
                func.lower(Driver.surname).like(pattern),
                func.lower(Driver.nationality).like(pattern),
                func.lower(Driver.code).like(pattern),
            )
        )

    stmt = stmt.order_by(Driver.surname, Driver.forename)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    paged_stmt = stmt.offset(pagination.offset).limit(pagination.page_size)
    rows = db.execute(paged_stmt).all()

    return rows, total


def get_driver_by_ref(db: Session, driver_ref: str) -> Optional[Driver]:
    return db.execute(select(Driver).where(Driver.driver_ref == driver_ref)).scalar_one_or_none()


def get_driver_career_stats(db: Session, driver_id: int) -> dict:
    """
    Full stats breakdown for a single driver's detail page — includes
    the points-finish/no-points-finish split that the list endpoint
    doesn't need.
    """
    row = db.execute(
        select(
            func.count().label("total_races"),
            func.sum(case((Result.position == 1, 1), else_=0)).label("wins"),
            func.sum(case((Result.position.in_([1, 2, 3]), 1), else_=0)).label("podiums"),
            func.sum(case((Result.position.is_(None), 1), else_=0)).label("dnfs"),
            func.avg(case((Result.position.isnot(None), Result.position))).label("avg_finish"),
            func.sum(
                case(
                    (
                        and_(
                            Result.position.isnot(None),
                            Result.position > 3,
                            Result.points > 0,
                        ),
                        1,
                    ),
                    else_=0,
                )
            ).label("points_finishes"),
        ).where(Result.driver_id == driver_id)
    ).one()

    champs_subq = _championships_subquery()
    championships = (
        db.execute(
            select(champs_subq.c.championships).where(champs_subq.c.driver_id == driver_id)
        ).scalar_one_or_none()
        or 0
    )

    total_races = row.total_races or 0
    wins = row.wins or 0
    podiums = row.podiums or 0
    dnfs = row.dnfs or 0
    points_finishes = row.points_finishes or 0
    classified_finishes = total_races - dnfs

    return {
        "total_races": total_races,
        "wins": wins,
        "podiums": podiums,
        "dnfs": dnfs,
        "avg_finish": float(row.avg_finish) if row.avg_finish is not None else 0.0,
        "championships": championships,
        "points_finishes": points_finishes,
        "no_points_finishes": max(classified_finishes - podiums - points_finishes, 0),
    }


def get_wins_by_season(db: Session, driver_id: int) -> List[dict]:
    rows = (
        db.execute(
            select(Race.year, func.sum(case((Result.position == 1, 1), else_=0)).label("wins"))
            .join(Result, Result.race_id == Race.race_id)
            .where(Result.driver_id == driver_id)
            .group_by(Race.year)
            .order_by(Race.year)
        )
        .all()
    )
    return [{"season": year, "wins": wins or 0} for year, wins in rows]
