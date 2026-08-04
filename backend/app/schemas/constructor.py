"""
Constructor response schema.

Matches `frontend/src/types/constructor.ts`'s ConstructorSummary
exactly. Unlike drivers, there's no dedicated constructor detail page in
the frontend (the list page's cards already show everything, including
the trend sparkline) — so this is the only schema this resource needs.
"""

from typing import List, Optional

from app.schemas.base import CamelModel


class SeasonTrendPoint(CamelModel):
    season: int
    wins: int


class ConstructorSummary(CamelModel):
    constructor_id: int
    constructor_ref: str
    name: str
    nationality: Optional[str]
    wins: int
    championships: int
    podiums: int
    first_season: int
    recent_trend: List[SeasonTrendPoint]
