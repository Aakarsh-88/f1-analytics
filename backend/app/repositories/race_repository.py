"""
Race data access layer.

Scoped deliberately narrow: only the two functions dashboard_service.py
actually calls. Follows the same query style as result_repository.py
(plain `select()`, no ORM-relationship shortcuts beyond what's needed).
"""

import math
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.lap_time import LapTime
from app.models.pit_stop import PitStop
from app.models.qualifying import Qualifying
from app.models.race import Race
from app.models.result import Result


def get_most_recent_race(db: Session) -> Optional[Race]:
    """
    The most recent race, using this priority chain:
      1. Non-null `Race.date`, descending
      2. `Race.year`, descending
      3. `Race.round`, descending
      4. `Race.race_id`, descending (deterministic final tie-breaker)

    `Race.date.is_(None)` is the primary sort key so every dated race
    sorts ahead of every undated one — Postgres's default NULL ordering
    for `DESC` is NULLS FIRST, which would otherwise let an undated
    race win purely for lacking a date. Once dated races are ranked by
    date, the remaining keys only ever matter when comparing two
    undated races (or ties) against each other, since `year`/`round`
    monotonically track chronology even where `date` is missing.
    Returns None on an empty database.
    """
    stmt = (
        select(Race)
        .order_by(
            Race.date.is_(None),
            Race.date.desc(),
            Race.year.desc(),
            Race.round.desc(),
            Race.race_id.desc(),
        )
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_race_results(db: Session, race_id: int) -> Sequence[Result]:
    """
    Every Result for one race, ordered by finishing order (position_order
    handles DNFs correctly, since a DNF has no `position` to sort by).

    Eager-loads `driver` and `constructor` via `joinedload` so
    dashboard_service.py's `result.driver.full_name` /
    `result.constructor.name` / `result.constructor.constructor_ref`
    accesses don't trigger a separate lazy-load query per result.
    Returns an empty sequence (never None) if the race has no results.
    """
    stmt = (
        select(Result)
        .options(joinedload(Result.driver), joinedload(Result.constructor))
        .where(Result.race_id == race_id)
        .order_by(Result.position_order)
    )
    return db.execute(stmt).scalars().all()


def list_races(db: Session) -> Sequence[Race]:
    """Return all races, newest season and round first."""
    stmt = select(Race).order_by(Race.year.desc(), Race.round.desc(), Race.race_id.desc())
    return db.execute(stmt).scalars().all()


def get_race_by_id(db: Session, race_id: int) -> Optional[Race]:
    """Return one race by primary key, or None when it does not exist."""
    stmt = select(Race).where(Race.race_id == race_id)
    return db.execute(stmt).scalar_one_or_none()


def get_race_qualifying(db: Session, race_id: int) -> Sequence[Qualifying]:
    """Return qualifying entries ordered by qualifying position."""
    stmt = (
        select(Qualifying)
        .options(joinedload(Qualifying.driver), joinedload(Qualifying.constructor))
        .where(Qualifying.race_id == race_id)
        .order_by(Qualifying.position.asc().nullslast(), Qualifying.qualify_id)
    )
    return db.execute(stmt).scalars().all()


def get_race_pit_stops(db: Session, race_id: int) -> Sequence[PitStop]:
    """Return pit stops in stop/lap order, with drivers eagerly loaded."""
    stmt = (
        select(PitStop)
        .options(joinedload(PitStop.driver))
        .where(PitStop.race_id == race_id)
        .order_by(PitStop.stop, PitStop.lap, PitStop.driver_id)
    )
    return db.execute(stmt).scalars().all()


def get_race_lap_times(db: Session, race_id: int) -> Sequence[LapTime]:
    """Return lap times in lap/driver order, with drivers eagerly loaded."""
    stmt = (
        select(LapTime)
        .options(joinedload(LapTime.driver))
        .where(LapTime.race_id == race_id)
        .order_by(LapTime.lap, LapTime.driver_id)
    )
    return db.execute(stmt).scalars().all()


def parse_lap_time_to_seconds(value: Optional[str]) -> Optional[float]:
    """Parse a lap-time string into seconds rounded to milliseconds."""
    if value is None:
        return None

    try:
        text = str(value).strip()
        if not text:
            return None

        parts = text.split(":")
        if len(parts) == 1:
            seconds = float(parts[0])
        elif len(parts) == 2:
            minutes = float(parts[0])
            remainder = float(parts[1])
            if minutes < 0 or remainder < 0 or remainder >= 60:
                return None
            seconds = minutes * 60 + remainder
        else:
            return None

        if not math.isfinite(seconds) or seconds < 0:
            return None
        return round(seconds, 3)
    except (TypeError, ValueError, OverflowError):
        return None
