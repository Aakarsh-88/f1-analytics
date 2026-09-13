"""
Standings business logic layer.

The one non-trivial piece here is `_build_progression`: the repository
returns flat (race, driver_id, points) tuples, and this pivots them
into the frontend's expected shape — one dict per round, with a
dynamic key per driver code (e.g. {"round": 1, "raceName": "Bahrain",
"VER": 25, "NOR": 18}) — matching ChampionshipProgressionPoint exactly.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.repositories import standings_repository
from app.utils.exceptions import NotFoundException

PROGRESSION_TOP_N = 3


def _driver_code_or_fallback(code: Optional[str], driver_ref: str) -> str:
    return code if code else driver_ref[:3].upper()


def _build_progression(db: Session, season: int, last_race_id: int) -> tuple[List[dict], List[str]]:
    top_drivers = standings_repository.get_top_drivers_for_progression(db, last_race_id, PROGRESSION_TOP_N)
    if not top_drivers:
        return [], []

    driver_ids = [d[0] for d in top_drivers]
    code_by_driver_id = {
        driver_id: _driver_code_or_fallback(code, driver_ref) for driver_id, code, driver_ref in top_drivers
    }
    driver_codes_in_order = [code_by_driver_id[driver_id] for driver_id in driver_ids]

    rows = standings_repository.get_progression_rows(db, season, driver_ids)

    progression_by_round: dict = {}
    for race, driver_id, points in rows:
        entry = progression_by_round.setdefault(race.round, {"round": race.round, "raceName": race.name})
        entry[code_by_driver_id[driver_id]] = points

    progression = [progression_by_round[r] for r in sorted(progression_by_round.keys())]
    return progression, driver_codes_in_order


def _build_constructor_progression(
    db: Session, season: int, last_race_id: int
) -> tuple[List[dict], List[str]]:
    top_constructors = standings_repository.get_top_constructors_for_progression(
        db, last_race_id, PROGRESSION_TOP_N
    )
    if not top_constructors:
        return [], []

    constructor_ids = [constructor[0] for constructor in top_constructors]
    constructor_refs = [constructor[1] for constructor in top_constructors]
    rows = standings_repository.get_constructor_progression_rows(db, season, constructor_ids)

    progression_by_round: dict = {}
    for race, constructor_id, points in rows:
        entry = progression_by_round.setdefault(
            race.round, {"round": race.round, "raceName": race.name}
        )
        constructor_ref = constructor_refs[constructor_ids.index(constructor_id)]
        entry[constructor_ref] = points

    progression = [progression_by_round[r] for r in sorted(progression_by_round.keys())]
    return progression, constructor_refs


def get_standings_data(db: Session, season: Optional[int]) -> dict:
    if season is None:
        season = standings_repository.get_latest_season(db)
        if season is None:
            raise NotFoundException("No season data available yet — has the CSV import been run?")

    last_race = standings_repository.get_last_race_of_season(db, season)
    if last_race is None:
        raise NotFoundException(f"No races found for season {season}", details={"season": season})

    driver_rows = standings_repository.get_driver_standings_rows(db, last_race.race_id)
    constructor_rows = standings_repository.get_constructor_standings_rows(db, last_race.race_id)
    progression, progression_driver_codes = _build_progression(db, season, last_race.race_id)
    constructor_progression, progression_constructor_refs = _build_constructor_progression(
        db, season, last_race.race_id
    )

    return {
        "season": season,
        "driver_standings": [
            {
                "position": position,
                "driver_name": driver.full_name,
                "driver_code": _driver_code_or_fallback(driver.code, driver.driver_ref),
                "constructor_name": constructor_name,
                "constructor_ref": constructor_ref,
                "points": float(points),
                "wins": wins,
            }
            for position, driver, constructor_name, constructor_ref, points, wins in driver_rows
        ],
        "constructor_standings": [
            {
                "position": position,
                "constructor_name": constructor_name,
                "constructor_ref": constructor_ref,
                "points": float(points),
                "wins": wins,
            }
            for position, constructor_name, constructor_ref, points, wins in constructor_rows
        ],
        "progression": progression,
        "progression_driver_codes": progression_driver_codes,
        "constructor_progression": constructor_progression,
        "progression_constructor_refs": progression_constructor_refs,
    }
