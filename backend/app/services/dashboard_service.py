"""
Dashboard business logic layer.

Two deliberate reuses of existing repository functions, rather than
duplicating their logic:
  - `constructor_repository.get_recent_seasons()` (built in Phase 2) for
    "which N most recent seasons have data" — exactly the same question
    the constructor trend sparkline already answers.
  - `race_repository.get_most_recent_race()` (the one new function added
    to race_repository.py this phase) + `get_race_results()` (built in
    Phase 3's Races API) for the podium — no new results-fetching query
    needed at all.

Unlike Standings (where a specific requested season not existing is a
meaningful 404), an empty database here just means zeros and empty
lists — the dashboard is a landing page, not a lookup of a specific
resource, so there's nothing to 404 on.
"""

from typing import List

from sqlalchemy.orm import Session

from app.repositories import constructor_repository, dashboard_repository, race_repository

CHART_SEASON_COUNT = 6
PODIUM_SIZE = 3


def _wins_by_season_chart(db: Session) -> List[dict]:
    years = constructor_repository.get_recent_seasons(db, CHART_SEASON_COUNT)
    counts = dashboard_repository.get_race_counts_by_season(db, years)
    return [{"season": year, "wins": counts.get(year, 0)} for year in years]


def _latest_race_podium(db: Session) -> List[dict]:
    latest_race = race_repository.get_most_recent_race(db)
    if latest_race is None:
        return []

    results = race_repository.get_race_results(db, latest_race.race_id)
    podium = []
    for position, result in enumerate(results[:PODIUM_SIZE], start=1):
        podium.append(
            {
                "position": position,
                "driver_name": result.driver.full_name,
                "constructor_name": result.constructor.name,
                "constructor_ref": result.constructor.constructor_ref,
                "points": float(result.points),
            }
        )
    return podium


def get_dashboard_stats(db: Session) -> dict:
    return {
        "total_races": dashboard_repository.get_total_races(db),
        "total_drivers": dashboard_repository.get_total_drivers(db),
        "total_constructors": dashboard_repository.get_total_constructors(db),
        "total_seasons": dashboard_repository.get_total_seasons(db),
        "wins_by_season_chart": _wins_by_season_chart(db),
        "latest_race_podium": _latest_race_podium(db),
    }
