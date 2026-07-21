"""
Health check endpoint.

This is the first real endpoint in the project on purpose: it proves the
FastAPI app, database connection, and cache connection are all correctly
wired before we build a single feature route on top of them. Every
Docker/Kubernetes/Railway/Render deployment in later milestones points
its health probe at this route.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.cache import check_cache_connection
from app.core.database import check_database_connection

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    database: str
    cache: str


@router.get("", response_model=HealthResponse, summary="Check API and dependency health")
def health_check() -> HealthResponse:
    db_ok = check_database_connection()
    cache_ok = check_cache_connection()

    # The API is considered "ok" even if the cache is down (cache is an
    # optimization, not a hard dependency) — but "degraded" if the
    # database is unreachable, since almost nothing works without it.
    overall = "ok" if db_ok else "degraded"

    return HealthResponse(
        status=overall,
        database="connected" if db_ok else "unreachable",
        cache="connected" if cache_ok else "unreachable",
    )
