"""
Result data access layer.

Unlike drivers/constructors, this isn't an aggregation — it's a
filterable, paginated JOIN across Result -> Race -> Driver ->
Constructor -> Status, giving each row enough context (race name,
season, round) to be meaningful on its own, since results here aren't
scoped to a single race the way race_repository.get_race_results() is.
"""

from typing import Optional, Sequence, Tuple

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.race import Race
from app.models.result import Result
from app.models.status import Status
from app.utils.pagination import PaginationParams


def list_results(
    db: Session,
    driver_ref: Optional[str],
    constructor_ref: Optional[str],
    season: Optional[int],
    race_id: Optional[int],
    pagination: PaginationParams,
) -> Tuple[Sequence, int]:
    stmt: Select = (
        select(Result, Race, Driver, Constructor, Status)
        .join(Race, Race.race_id == Result.race_id)
        .join(Driver, Driver.driver_id == Result.driver_id)
        .join(Constructor, Constructor.constructor_id == Result.constructor_id)
        .join(Status, Status.status_id == Result.status_id)
    )

    if driver_ref:
        stmt = stmt.where(Driver.driver_ref == driver_ref)
    if constructor_ref:
        stmt = stmt.where(Constructor.constructor_ref == constructor_ref)
    if season:
        stmt = stmt.where(Race.year == season)
    if race_id:
        stmt = stmt.where(Race.race_id == race_id)

    # Most recent season first, then chronological within a season, then
    # finishing order within a race — the natural "browse history" order.
    stmt = stmt.order_by(Race.year.desc(), Race.round.desc(), Result.position_order)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    paged_stmt = stmt.offset(pagination.offset).limit(pagination.page_size)
    rows = db.execute(paged_stmt).all()

    return rows, total
