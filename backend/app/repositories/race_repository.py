"""
Race data access layer.

Scoped deliberately narrow: only the two functions dashboard_service.py
actually calls. Follows the same query style as result_repository.py
(plain `select()`, no ORM-relationship shortcuts beyond what's needed).
"""

from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

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
