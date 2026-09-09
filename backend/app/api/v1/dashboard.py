"""
Dashboard API.

    GET /api/v1/dashboard - landing-page stats: totals, recent-season
    race counts, and the latest race's podium.

Always returns 200, even against an empty database (zeros/empty
arrays) - this is a landing page, not a lookup of one specific
resource, so there's nothing to 404 on.
"""

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats, summary="Landing-page stats and latest race podium")
def get_dashboard(db: DbSession) -> dict:
    return dashboard_service.get_dashboard_stats(db)
