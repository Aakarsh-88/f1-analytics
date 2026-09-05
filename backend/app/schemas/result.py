"""
Result response schema.

Unlike drivers/constructors/races, there is no pre-existing frontend
TypeScript type this must match — `RaceResultRow` in
`frontend/src/types/race.ts` only exists nested inside a single race's
RaceDetail. This is a genuinely new capability: a driver's or
constructor's full result history across every race, filterable by
driver/constructor/season — something no other endpoint currently
exposes (driver detail only has AGGREGATE stats, never the literal
race-by-race list).
"""

from typing import Optional

from app.schemas.base import CamelModel


class ResultRow(CamelModel):
    race_id: int
    race_name: str
    season: int
    round: int
    driver_name: str
    driver_ref: str
    constructor_name: str
    constructor_ref: str
    grid: int
    position: Optional[int]
    position_text: str
    points: float
    laps: int
    status: str
    fastest_lap_time: Optional[str]
