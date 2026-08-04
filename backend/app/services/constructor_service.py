"""
Constructor business logic layer.

Note on `recent_trend`: computing it requires one extra small query PER
constructor (its wins broken down by the last N seasons), run only for
the current page of results — not all constructors in the table. With
the default page size (25) that's 25 small indexed queries per request,
which is a reasonable, bounded trade-off for now rather than a true
N+1-over-everything problem. If this page size grows substantially or
this endpoint gets hot, the next step would be a single query computing
all constructors' trends at once (GROUP BY constructor_id, year) and
assembling the per-row lists in Python — noted here rather than done
now, since it adds real complexity for a benefit this endpoint doesn't
need yet.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.repositories import constructor_repository
from app.utils.pagination import PaginatedResponse, PaginationParams

RECENT_TREND_SEASONS = 5


def _constructor_summary_dict(
    db: Session,
    constructor: Constructor,
    wins: int,
    podiums: int,
    championships: int,
    first_season: int,
    recent_years: list,
) -> dict:
    recent_trend = constructor_repository.get_wins_by_season_for_years(
        db, constructor.constructor_id, recent_years
    )
    return {
        "constructor_id": constructor.constructor_id,
        "constructor_ref": constructor.constructor_ref,
        "name": constructor.name,
        "nationality": constructor.nationality,
        "wins": wins,
        "podiums": podiums,
        "championships": championships,
        "first_season": first_season,
        "recent_trend": recent_trend,
    }


def list_constructors(
    db: Session, search: Optional[str], pagination: PaginationParams
) -> PaginatedResponse:
    rows, total = constructor_repository.list_constructors_with_stats(db, search, pagination)
    recent_years = constructor_repository.get_recent_seasons(db, RECENT_TREND_SEASONS)

    items = [
        _constructor_summary_dict(db, constructor, wins, podiums, championships, first_season, recent_years)
        for constructor, wins, podiums, championships, first_season in rows
    ]

    return PaginatedResponse.build(items=items, total=total, pagination=pagination)
