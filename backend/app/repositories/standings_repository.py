"""
Standings data access layer.

Key schema fact this whole file works around: `driver_standings` has NO
`constructor_id` column (checked the model directly) — a driver's
constructor for a given standings snapshot has to come from joining
`results` on `(race_id, driver_id)`, since that's where the
driver-to-constructor relationship for a specific race actually lives.
`constructor_standings`, by contrast, already has `constructor_id`
directly.

"Final standings" for a season means the driver_standings/
constructor_standings rows at that season's LAST race (max round) —
same definition already established in driver_repository.py and
constructor_repository.py's championship logic, applied here directly
rather than re-derived.
"""

from typing import List, Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.models.constructor_standing import ConstructorStanding
from app.models.driver import Driver
from app.models.driver_standing import DriverStanding
from app.models.race import Race
from app.models.result import Result


def get_latest_season(db: Session) -> Optional[int]:
    return db.execute(select(func.max(Race.year))).scalar_one_or_none()


def get_last_race_of_season(db: Session, season: int) -> Optional[Race]:
    stmt = select(Race).where(Race.year == season).order_by(Race.round.desc()).limit(1)
    return db.execute(stmt).scalar_one_or_none()


def get_driver_standings_rows(db: Session, last_race_id: int) -> Sequence:
    """Each row: (position, driver, constructor_name, constructor_ref, points, wins)."""
    stmt = (
        select(
            DriverStanding.position,
            Driver,
            Constructor.name.label("constructor_name"),
            Constructor.constructor_ref.label("constructor_ref"),
            DriverStanding.points,
            DriverStanding.wins,
        )
        .join(Driver, Driver.driver_id == DriverStanding.driver_id)
        .join(
            Result,
            (Result.race_id == DriverStanding.race_id) & (Result.driver_id == DriverStanding.driver_id),
        )
        .join(Constructor, Constructor.constructor_id == Result.constructor_id)
        .where(DriverStanding.race_id == last_race_id)
        .order_by(DriverStanding.position)
    )
    return db.execute(stmt).all()


def get_constructor_standings_rows(db: Session, last_race_id: int) -> Sequence:
    """Each row: (position, constructor_name, constructor_ref, points, wins)."""
    stmt = (
        select(
            ConstructorStanding.position,
            Constructor.name.label("constructor_name"),
            Constructor.constructor_ref.label("constructor_ref"),
            ConstructorStanding.points,
            ConstructorStanding.wins,
        )
        .join(Constructor, Constructor.constructor_id == ConstructorStanding.constructor_id)
        .where(ConstructorStanding.race_id == last_race_id)
        .order_by(ConstructorStanding.position)
    )
    return db.execute(stmt).all()


def get_top_drivers_for_progression(db: Session, last_race_id: int, top_n: int) -> List[Tuple[int, str, str]]:
    """Returns (driver_id, code, driver_ref) for the top N drivers in final position order."""
    stmt = (
        select(DriverStanding.driver_id, Driver.code, Driver.driver_ref)
        .join(Driver, Driver.driver_id == DriverStanding.driver_id)
        .where(DriverStanding.race_id == last_race_id)
        .order_by(DriverStanding.position)
        .limit(top_n)
    )
    return db.execute(stmt).all()


def get_top_constructors_for_progression(
    db: Session, last_race_id: int, top_n: int
) -> List[Tuple[int, str]]:
    """Returns (constructor_id, constructor_ref) in final position order."""
    stmt = (
        select(ConstructorStanding.constructor_id, Constructor.constructor_ref)
        .join(Constructor, Constructor.constructor_id == ConstructorStanding.constructor_id)
        .where(ConstructorStanding.race_id == last_race_id)
        .order_by(ConstructorStanding.position)
        .limit(top_n)
    )
    return db.execute(stmt).all()


def get_progression_rows(db: Session, season: int, driver_ids: List[int]) -> List[Tuple[Race, int, float]]:
    """
    Every (race, driver_id, points) tuple for the given drivers across
    every race of the season — the caller pivots this into one row per
    round with one column per driver.
    """
    races = db.execute(select(Race).where(Race.year == season).order_by(Race.round)).scalars().all()
    race_ids = [r.race_id for r in races]

    if not driver_ids or not race_ids:
        return [(race, driver_id, 0.0) for race in races for driver_id in driver_ids]

    standings = db.execute(
        select(DriverStanding.race_id, DriverStanding.driver_id, DriverStanding.points).where(
            DriverStanding.race_id.in_(race_ids), DriverStanding.driver_id.in_(driver_ids)
        )
    ).all()
    points_by_key = {(race_id, driver_id): float(points) for race_id, driver_id, points in standings}

    races_by_id = {r.race_id: r for r in races}
    return [
        (races_by_id[race_id], driver_id, points_by_key.get((race_id, driver_id), 0.0))
        for race_id in race_ids
        for driver_id in driver_ids
    ]


def get_constructor_progression_rows(
    db: Session, season: int, constructor_ids: List[int]
) -> List[Tuple[Race, int, float]]:
    """Every (race, constructor_id, points) tuple for the selected constructors."""
    races = db.execute(select(Race).where(Race.year == season).order_by(Race.round)).scalars().all()
    race_ids = [race.race_id for race in races]

    if not constructor_ids or not race_ids:
        return [(race, constructor_id, 0.0) for race in races for constructor_id in constructor_ids]

    standings = db.execute(
        select(
            ConstructorStanding.race_id,
            ConstructorStanding.constructor_id,
            ConstructorStanding.points,
        ).where(
            ConstructorStanding.race_id.in_(race_ids),
            ConstructorStanding.constructor_id.in_(constructor_ids),
        )
    ).all()
    points_by_key = {
        (race_id, constructor_id): float(points)
        for race_id, constructor_id, points in standings
    }
    races_by_id = {race.race_id: race for race in races}
    return [
        (races_by_id[race_id], constructor_id, points_by_key.get((race_id, constructor_id), 0.0))
        for race_id in race_ids
        for constructor_id in constructor_ids
    ]
