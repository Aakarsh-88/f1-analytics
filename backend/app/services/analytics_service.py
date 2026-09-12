"""Analytics business logic and response mapping."""

from collections import defaultdict
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.repositories import analytics_repository
from app.schemas.analytics import (
    AnalyticsData,
    AvgQualifying,
    AvgQualifyingPoint,
    ConstructorDominance,
    ConstructorInfo,
    ConstructorPoint,
    FastestLapLeaderboardRow,
    PoleLeaderboardRow,
    PodiumTrendPoint,
    PodiumTrends,
    SeasonRange,
    DriverTeamInfo,
    DriverTeamPoint,
)


def _driver_name(forename: str, surname: str) -> str:
    return f"{forename} {surname}"


def _constructor_dominance(rows) -> ConstructorDominance:
    constructors: Dict[str, str] = {}
    points_by_season: Dict[int, Dict[str, float]] = defaultdict(dict)

    for row in rows:
        year, constructor_ref, name, points = row
        constructors[constructor_ref] = name
        points_by_season[year][constructor_ref] = float(points or 0)

    return ConstructorDominance(
        constructors=[
            ConstructorInfo(ref=ref, name=name)
            for ref, name in sorted(constructors.items())
        ],
        points=[
            ConstructorPoint(season=season, **season_points)
            for season, season_points in sorted(points_by_season.items())
        ],
    )


def _average_qualifying(rows) -> AvgQualifying:
    points_by_season: Dict[int, Dict[str, float]] = defaultdict(dict)
    driver_codes = set()

    for row in rows:
        season, driver_code, average_position = row
        driver_codes.add(driver_code)
        points_by_season[season][driver_code] = float(average_position)

    return AvgQualifying(
        driver_codes=sorted(driver_codes),
        points=[
            AvgQualifyingPoint(season=season, **season_points)
            for season, season_points in sorted(points_by_season.items())
        ],
    )


def _podium_trends(rows) -> PodiumTrends:
    points_by_season: Dict[int, Dict[str, float]] = defaultdict(dict)
    driver_codes = set()

    for row in rows:
        season, driver_code, podiums = row
        driver_codes.add(driver_code)
        points_by_season[season][driver_code] = int(podiums or 0)

    return PodiumTrends(
        driver_codes=sorted(driver_codes),
        points=[
            PodiumTrendPoint(season=season, **season_points)
            for season, season_points in sorted(points_by_season.items())
        ],
    )


def _driver_teams(rows) -> List[DriverTeamPoint]:
    constructors_by_driver: Dict[tuple[int, str], List[DriverTeamInfo]] = defaultdict(list)

    for season, driver_code, constructor_ref, constructor_name in rows:
        constructors_by_driver[(season, driver_code)].append(
            DriverTeamInfo(ref=constructor_ref, name=constructor_name)
        )

    return [
        DriverTeamPoint(
            season=season,
            driver_code=driver_code,
            constructors=constructors,
        )
        for (season, driver_code), constructors in sorted(constructors_by_driver.items())
    ]


def get_analytics_data(db: Session) -> AnalyticsData:
    minimum, maximum = analytics_repository.get_season_range(db)
    pole_rows = analytics_repository.get_pole_leaderboard(db)
    fastest_lap_rows = analytics_repository.get_fastest_lap_leaderboard(db)
    constructor_rows = analytics_repository.get_constructor_dominance(db)
    qualifying_rows = analytics_repository.get_average_qualifying(db)
    podium_rows = analytics_repository.get_podium_trends(db)
    driver_team_rows = analytics_repository.get_driver_teams(db)

    return AnalyticsData(
        season_range=SeasonRange(min=minimum or 0, max=maximum or 0),
        constructor_dominance=_constructor_dominance(constructor_rows),
        pole_leaderboard=[
            PoleLeaderboardRow(
                driver_code=row.driver_code,
                driver_name=_driver_name(row.forename, row.surname),
                poles=int(row.poles),
            )
            for row in pole_rows
        ],
        fastest_lap_leaderboard=[
            FastestLapLeaderboardRow(
                driver_code=row.driver_code,
                driver_name=_driver_name(row.forename, row.surname),
                fastest_laps=int(row.fastest_laps),
            )
            for row in fastest_lap_rows
        ],
        avg_qualifying=_average_qualifying(qualifying_rows),
        podium_trends=_podium_trends(podium_rows),
        driver_teams=_driver_teams(driver_team_rows),
    )
