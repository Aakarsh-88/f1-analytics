"""
Constructors API.

    GET /api/v1/constructors - paginated, searchable list with career stats

Field names are camelCase (see schemas/base.py) to match
frontend/src/types/constructor.ts exactly.
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.api.deps import DbSession, Pagination
from app.schemas.constructor import ConstructorSummary
from app.services import constructor_service
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/constructors", tags=["constructors"])


@router.get(
    "",
    response_model=PaginatedResponse[ConstructorSummary],
    summary="List constructors with career stats and recent form, paginated and searchable",
)
def list_constructors(
    db: DbSession,
    pagination: Pagination,
    search: Optional[str] = Query(
        default=None, description="Case-insensitive match against name or nationality"
    ),
) -> PaginatedResponse:
    return constructor_service.list_constructors(db, search, pagination)
