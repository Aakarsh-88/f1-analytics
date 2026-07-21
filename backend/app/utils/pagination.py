"""
Reusable pagination primitives shared by every list endpoint
(drivers, constructors, races, standings, etc.) so pagination behavior
and response shape are identical across the whole API.
"""

from typing import Generic, List, Sequence, TypeVar

from fastapi import Query
from pydantic import BaseModel, Field
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.config import settings

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters accepted by every paginated list endpoint."""

    page: int = Field(default=1, ge=1, description="1-indexed page number")
    page_size: int = Field(
        default=settings.default_page_size,
        ge=1,
        le=settings.max_page_size,
        description="Number of items per page",
    )

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def pagination_params(
    page: int = Query(default=1, ge=1, description="1-indexed page number"),
    page_size: int = Query(
        default=settings.default_page_size,
        ge=1,
        le=settings.max_page_size,
        description="Items per page",
    ),
) -> PaginationParams:
    """FastAPI dependency version of PaginationParams (for use with Depends())."""
    return PaginationParams(page=page, page_size=page_size)


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard envelope returned by every paginated endpoint in this API."""

    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def build(
        cls,
        items: Sequence[T],
        total: int,
        pagination: PaginationParams,
    ) -> "PaginatedResponse[T]":
        total_pages = (total + pagination.page_size - 1) // pagination.page_size if total else 0
        return cls(
            items=list(items),
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages,
        )


def paginate_query(db: Session, stmt: Select, pagination: PaginationParams):
    """
    Applies LIMIT/OFFSET to a SQLAlchemy 2.0 Select statement and returns
    both the page of results and the total count (via a separate COUNT
    query over the same filters, before LIMIT/OFFSET is applied).

    Usage:
        stmt = select(Driver).where(Driver.nationality == "British")
        items, total = paginate_query(db, stmt, pagination)
    """
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    paged_stmt = stmt.offset(pagination.offset).limit(pagination.page_size)
    items = db.execute(paged_stmt).scalars().all()

    return items, total
