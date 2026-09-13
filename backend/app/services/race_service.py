"""Race business logic and response mapping."""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.repositories import race_repository
from app.schemas.race import (
    LapTimePoint,
    PitStopRow,
    QualifyingRow,
    RaceDetail,
    RaceResultRow,
    RaceSummary,
)
from app.utils.exceptions import NotFoundException


def _constructor_abbreviation(name: str, constructor_ref: str) -> str:
    words = [word for word in name.replace("-", " ").split() if word]
    if len(words) >= 3:
        abbreviation = "".join(word[0] for word in words)
    elif len(words) == 2:
        abbreviation = "".join(word[0] for word in words) + words[-1][1:2]
    else:
        abbreviation = name[:3]
    abbreviation = "".join(character for character in abbreviation.upper() if character.isalpha())
    return (abbreviation + constructor_ref.upper())[:3]


def _race_summary(race) -> RaceSummary:
    winner = next(
        (result for result in race.results if result.position_order == 1),
        None,
    )
    return RaceSummary(
        race_id=race.race_id,
        year=race.year,
        round=race.round,
        name=race.name,
        circuit_name=race.circuit.name if race.circuit else "",
        country=race.circuit.country if race.circuit else None,
        date=race.date.isoformat() if race.date else "",
        winner_driver_name=winner.driver.full_name if winner else None,
        winner_constructor_name=winner.constructor.name if winner else None,
        winner_constructor_ref=winner.constructor.constructor_ref if winner else None,
        winner_constructor_abbreviation=(
            _constructor_abbreviation(winner.constructor.name, winner.constructor.constructor_ref)
            if winner
            else None
        ),
    )


def list_races(db: Session, season: Optional[int] = None) -> List[RaceSummary]:
    return [_race_summary(race) for race in race_repository.list_races(db, season)]


def get_race_detail(db: Session, race_id: int) -> RaceDetail:
    race = race_repository.get_race_by_id(db, race_id)
    if race is None:
        raise NotFoundException(
            f"No race found with id '{race_id}'",
            details={"race_id": race_id},
        )

    results = [
        RaceResultRow(
            position=result.position,
            position_text=result.position_text or "",
            driver_name=result.driver.full_name,
            constructor_name=result.constructor.name,
            constructor_ref=result.constructor.constructor_ref,
            grid=result.grid,
            points=float(result.points),
            laps=result.laps,
            status=result.status.status if result.status else "",
            fastest_lap_time=result.fastest_lap_time,
        )
        for result in race_repository.get_race_results(db, race_id)
    ]

    qualifying = [
        QualifyingRow(
            position=row.position,
            driver_name=row.driver.full_name,
            constructor_name=row.constructor.name,
            constructor_ref=row.constructor.constructor_ref,
            q1=row.q1,
            q2=row.q2,
            q3=row.q3,
        )
        for row in race_repository.get_race_qualifying(db, race_id)
    ]

    pit_stops = [
        PitStopRow(
            driver_name=row.driver.full_name,
            stop=row.stop,
            lap=row.lap,
            time=row.time,
            duration=row.duration,
        )
        for row in race_repository.get_race_pit_stops(db, race_id)
    ]

    lap_times = []
    for row in race_repository.get_race_lap_times(db, race_id):
        seconds = race_repository.parse_lap_time_to_seconds(row.time)
        if seconds is None:
            continue
        lap_times.append(
            LapTimePoint(
                lap=row.lap,
                driver_code=row.driver.code or row.driver.driver_ref,
                seconds=seconds,
            )
        )

    return RaceDetail(
        race=_race_summary(race),
        results=results,
        qualifying=qualifying,
        pit_stops=pit_stops,
        lap_times=lap_times,
    )
