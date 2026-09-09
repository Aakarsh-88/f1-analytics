"""
Dashboard response schema.

Matches `frontend/src/types/dashboard.ts`'s DashboardStats exactly.
Note: `SeasonRaceCount.wins` is genuinely "races held that season," kept
under the frontend's existing field name (`wins`) since every race has
exactly one winner — counting races per season IS counting wins per
season at this aggregate, non-driver-specific level.
"""

from typing import List, Optional

from app.schemas.base import CamelModel


class SeasonRaceCount(CamelModel):
    season: int
    wins: int


class PodiumFinisher(CamelModel):
    position: int
    driver_name: str
    constructor_name: str
    constructor_ref: str
    points: float


class DashboardStats(CamelModel):
    total_races: int
    total_drivers: int
    total_constructors: int
    total_seasons: int
    wins_by_season_chart: List[SeasonRaceCount]
    latest_race_podium: List[PodiumFinisher]
