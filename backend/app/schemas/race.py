"""
Race response schemas.

These schemas match the frontend race contract and use ``CamelModel`` so
their snake_case Python fields serialize to the expected camelCase names.
"""

from typing import List, Optional

from app.schemas.base import CamelModel


class RaceSummary(CamelModel):
    race_id: int
    year: int
    round: int
    name: str
    circuit_name: str
    country: Optional[str]
    date: str


class RaceResultRow(CamelModel):
    position: Optional[int]
    position_text: str
    driver_name: str
    constructor_name: str
    constructor_ref: str
    grid: int
    points: float
    laps: int
    status: str
    fastest_lap_time: Optional[str]


class QualifyingRow(CamelModel):
    position: Optional[int]
    driver_name: str
    constructor_name: str
    constructor_ref: str
    q1: Optional[str]
    q2: Optional[str]
    q3: Optional[str]


class PitStopRow(CamelModel):
    driver_name: str
    stop: int
    lap: int
    time: Optional[str]
    duration: Optional[str]


class LapTimePoint(CamelModel):
    lap: int
    driver_code: str
    seconds: float


class RaceDetail(CamelModel):
    race: RaceSummary
    results: List[RaceResultRow]
    qualifying: List[QualifyingRow]
    pit_stops: List[PitStopRow]
    lap_times: List[LapTimePoint]
