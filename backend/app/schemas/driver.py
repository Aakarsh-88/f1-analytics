"""
Driver response schemas.

Field names and nesting here match `frontend/src/types/driver.ts`
EXACTLY (DriverSummary, DriverDetail, ResultsBreakdown) — those types
were written in Milestone 5 against this eventual real API, so matching
them precisely is what lets the frontend's mock `getDrivers()` /
`getDriverDetail()` be replaced by real `fetch()` calls with no
reshaping logic in between.
"""

from typing import List, Optional

from app.schemas.base import CamelModel


class DriverSummary(CamelModel):
    driver_id: int
    driver_ref: str
    full_name: str
    code: Optional[str]
    number: Optional[int]
    nationality: Optional[str]
    wins: int
    podiums: int
    championships: int
    win_percentage: float


class SeasonWins(CamelModel):
    season: int
    wins: int


class ResultsBreakdown(CamelModel):
    wins: int
    other_podiums: int
    points_finishes: int
    no_points_finishes: int
    dnfs: int


class DriverDetail(CamelModel):
    summary: DriverSummary
    total_races: int
    average_finish: float
    dnf_percentage: float
    wins_by_season_chart: List[SeasonWins]
    results_breakdown: ResultsBreakdown
