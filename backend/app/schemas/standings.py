"""
Standings response schema.

Matches `frontend/src/types/standings.ts` exactly: DriverStandingRow,
ConstructorStandingRow, StandingsData. One deliberate exception:
`ChampionshipProgressionPoint`'s dynamic per-driver-code keys
(`{round, raceName, VER: 25, LEC: 18, ...}`) don't map cleanly onto a
fixed Pydantic model — rather than fight Pydantic's `extra="allow"`
machinery for a handful of dynamic keys, `progression` is typed as a
plain `List[Dict[str, Any]]`. FastAPI still serializes this correctly
into the exact shape the frontend expects; it just isn't validated
field-by-field the way the rest of the schema is.
"""

from typing import Any, Dict, List

from app.schemas.base import CamelModel


class DriverStandingRow(CamelModel):
    position: int
    driver_name: str
    driver_code: str
    constructor_name: str
    constructor_ref: str
    points: float
    wins: int


class ConstructorStandingRow(CamelModel):
    position: int
    constructor_name: str
    constructor_ref: str
    points: float
    wins: int


class StandingsData(CamelModel):
    season: int
    driver_standings: List[DriverStandingRow]
    constructor_standings: List[ConstructorStandingRow]
    progression: List[Dict[str, Any]]
    progression_driver_codes: List[str]
    constructor_progression: List[Dict[str, Any]]
    progression_constructor_refs: List[str]
