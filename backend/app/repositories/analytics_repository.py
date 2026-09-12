"""SQL aggregation queries for the Analytics API."""

from typing import Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.models.constructor_result import ConstructorResult
from app.models.driver import Driver
from app.models.qualifying import Qualifying
from app.models.race import Race
from app.models.result import Result


def get_season_range(db: Session) -> Tuple[Optional[int], Optional[int]]:
    """Return the minimum and maximum race seasons."""
    row = db.execute(select(func.min(Race.year), func.max(Race.year))).one()
    return row[0], row[1]


def get_constructor_dominance(db: Session) -> Sequence:
    """Return constructor points grouped by season and constructor."""
    stmt = (
        select(
            Race.year,
            Constructor.constructor_ref,
            Constructor.name,
            func.sum(ConstructorResult.points).label("points"),
        )
        .join(ConstructorResult, ConstructorResult.race_id == Race.race_id)
        .join(Constructor, Constructor.constructor_id == ConstructorResult.constructor_id)
        .group_by(Race.year, Constructor.constructor_ref, Constructor.name)
        .order_by(Race.year, Constructor.constructor_ref)
    )
    return db.execute(stmt).all()


def get_pole_leaderboard(db: Session) -> Sequence:
    """Return drivers ordered by their qualifying pole count."""
    driver_code = func.coalesce(Driver.code, Driver.driver_ref).label("driver_code")
    stmt = (
        select(
            driver_code,
            Driver.forename,
            Driver.surname,
            func.count().label("poles"),
        )
        .join(Qualifying, Qualifying.driver_id == Driver.driver_id)
        .where(Qualifying.position == 1)
        .group_by(Driver.driver_id, Driver.code, Driver.driver_ref, Driver.forename, Driver.surname)
        .order_by(func.count().desc(), Driver.surname, Driver.forename, Driver.driver_id)
    )
    return db.execute(stmt).all()


def get_fastest_lap_leaderboard(db: Session) -> Sequence:
    """Return drivers ordered by results marked as the fastest lap."""
    driver_code = func.coalesce(Driver.code, Driver.driver_ref).label("driver_code")
    stmt = (
        select(
            driver_code,
            Driver.forename,
            Driver.surname,
            func.count().label("fastest_laps"),
        )
        .join(Result, Result.driver_id == Driver.driver_id)
        .where(Result.rank == 1)
        .group_by(Driver.driver_id, Driver.code, Driver.driver_ref, Driver.forename, Driver.surname)
        .order_by(func.count().desc(), Driver.surname, Driver.forename, Driver.driver_id)
    )
    return db.execute(stmt).all()


def get_average_qualifying(db: Session) -> Sequence:
    """Return average qualifying position grouped by season and driver."""
    driver_code = func.coalesce(Driver.code, Driver.driver_ref).label("driver_code")
    stmt = (
        select(
            Race.year,
            driver_code,
            func.avg(Qualifying.position).label("average_position"),
        )
        .join(Qualifying, Qualifying.race_id == Race.race_id)
        .join(Driver, Driver.driver_id == Qualifying.driver_id)
        .where(Qualifying.position.is_not(None))
        .group_by(Race.year, Driver.driver_id, Driver.code, Driver.driver_ref)
        .order_by(Race.year, driver_code)
    )
    return db.execute(stmt).all()


def get_podium_trends(db: Session) -> Sequence:
    """Return podium counts grouped by season and driver."""
    driver_code = func.coalesce(Driver.code, Driver.driver_ref).label("driver_code")
    stmt = (
        select(
            Race.year,
            driver_code,
            func.count().label("podiums"),
        )
        .join(Result, Result.race_id == Race.race_id)
        .join(Driver, Driver.driver_id == Result.driver_id)
        .where(Result.position.in_([1, 2, 3]))
        .group_by(Race.year, Driver.driver_id, Driver.code, Driver.driver_ref)
        .order_by(Race.year, driver_code)
    )
    return db.execute(stmt).all()


def get_driver_teams(db: Session) -> Sequence:
    """Return constructors represented by each driver in each season."""
    driver_code = func.coalesce(Driver.code, Driver.driver_ref).label("driver_code")
    stmt = (
        select(
            Race.year,
            driver_code,
            Constructor.constructor_ref,
            Constructor.name,
        )
        .join(Result, Result.race_id == Race.race_id)
        .join(Driver, Driver.driver_id == Result.driver_id)
        .join(Constructor, Constructor.constructor_id == Result.constructor_id)
        .group_by(
            Race.year,
            Driver.driver_id,
            Driver.code,
            Driver.driver_ref,
            Constructor.constructor_ref,
            Constructor.name,
        )
        .order_by(Race.year, driver_code, Constructor.constructor_ref)
    )
    return db.execute(stmt).all()
