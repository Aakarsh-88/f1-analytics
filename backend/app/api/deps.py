"""
Shared FastAPI dependencies, re-exported from one place so route files
have a single, consistent import line:

    from app.api.deps import DbSession, Pagination, CurrentUserDep

This module intentionally contains no logic of its own — it's a thin
aggregation layer over `core.database`, `utils.pagination`, and
`core.security`.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.utils.pagination import PaginationParams, pagination_params

# Typed aliases — use these in route signatures instead of raw Depends(...)
# everywhere, e.g.:
#
#     @router.get("/drivers")
#     def list_drivers(db: DbSession, pagination: Pagination):
#         ...
DbSession = Annotated[Session, Depends(get_db)]
Pagination = Annotated[PaginationParams, Depends(pagination_params)]
CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
