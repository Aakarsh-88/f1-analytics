"""Analytics response schemas matching the frontend chart data contract."""

from typing import List

from pydantic import ConfigDict, Field

from app.schemas.base import CamelModel


class SeasonRange(CamelModel):
    min: int
    max: int


class ConstructorInfo(CamelModel):
    ref: str
    name: str


class ConstructorPoint(CamelModel):
    season: int
    model_config = ConfigDict(
        alias_generator=None,
        populate_by_name=True,
        from_attributes=True,
        extra="allow",
    )
    __pydantic_extra__: dict[str, float] = Field(init=False)


class ConstructorDominance(CamelModel):
    constructors: List[ConstructorInfo]
    points: List[ConstructorPoint]


class PoleLeaderboardRow(CamelModel):
    driver_code: str
    driver_name: str
    poles: int


class FastestLapLeaderboardRow(CamelModel):
    driver_code: str
    driver_name: str
    fastest_laps: int


class AvgQualifyingPoint(CamelModel):
    season: int
    model_config = ConfigDict(
        alias_generator=None,
        populate_by_name=True,
        from_attributes=True,
        extra="allow",
    )
    __pydantic_extra__: dict[str, float] = Field(init=False)


class AvgQualifying(CamelModel):
    driver_codes: List[str]
    points: List[AvgQualifyingPoint]


class PodiumTrendPoint(CamelModel):
    season: int
    model_config = ConfigDict(
        alias_generator=None,
        populate_by_name=True,
        from_attributes=True,
        extra="allow",
    )
    __pydantic_extra__: dict[str, int] = Field(init=False)


class PodiumTrends(CamelModel):
    driver_codes: List[str]
    points: List[PodiumTrendPoint]


class AnalyticsData(CamelModel):
    season_range: SeasonRange
    constructor_dominance: ConstructorDominance
    pole_leaderboard: List[PoleLeaderboardRow]
    fastest_lap_leaderboard: List[FastestLapLeaderboardRow]
    avg_qualifying: AvgQualifying
    podium_trends: PodiumTrends
