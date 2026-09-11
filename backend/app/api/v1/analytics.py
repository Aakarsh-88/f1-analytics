"""Analytics API."""

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.analytics import AnalyticsData
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "",
    response_model=AnalyticsData,
    summary="Season and all-time Formula 1 analytics",
)
def get_analytics(db: DbSession) -> AnalyticsData:
    return analytics_service.get_analytics_data(db)
