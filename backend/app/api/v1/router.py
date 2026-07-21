"""
Aggregates every v1 resource router into a single APIRouter that
`app/main.py` mounts once under the `/api/v1` prefix.

As each resource is built (drivers in Milestone 3+, races, standings,
etc.) its router is imported and included here — this file is the ONLY
place that needs to change when a new resource module is added; `main.py`
never needs to know about individual resources.
"""

from fastapi import APIRouter

from app.api.v1 import health

api_router = APIRouter()

api_router.include_router(health.router)

# --- Registered in later milestones as each resource is built ---
# from app.api.v1 import drivers, constructors, races, standings, qualifying, lap_times, pit_stops, dashboard
# api_router.include_router(drivers.router)
# api_router.include_router(constructors.router)
# api_router.include_router(races.router)
# api_router.include_router(standings.router)
# api_router.include_router(qualifying.router)
# api_router.include_router(lap_times.router)
# api_router.include_router(pit_stops.router)
# api_router.include_router(dashboard.router)
