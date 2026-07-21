"""
FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

This file is intentionally thin: it wires together configuration,
logging, middleware, exception handlers, and routers — but contains no
business logic and no route bodies of its own (other than the root `/`
route used as a friendly landing check).
"""

import logging
import time

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import check_database_connection
from app.utils.exceptions import AppException
from app.utils.logger import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    description="REST API powering the F1 Analytics Dashboard — historical race, "
    "driver, constructor, qualifying, lap time, and championship data.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# --- CORS ---
# Only the frontend origins listed in CORS_ORIGINS may call this API with
# credentials. Wildcards are deliberately never used here because Clerk
# auth (Milestone 6) relies on cookies/headers that require an explicit
# origin allowlist, not "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request timing + logging middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    logger.info(
        "%s %s -> %s (%.2fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
    return response


# --- Centralized exception handling ---
# Every custom exception raised anywhere in services/repositories bubbles
# up to here and is converted into a consistent JSON error shape:
#   { "error_code": "not_found", "message": "...", "details": null }
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning("AppException on %s %s: %s", request.method, request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Catch-all so an unexpected bug never leaks a raw Python traceback to
    # the client. Full traceback still goes to the logs for debugging.
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "internal_error",
            "message": "An unexpected error occurred. Please try again later.",
            "details": None,
        },
    )


# --- Routers ---
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["root"], summary="API root / landing check")
def root() -> dict:
    return {
        "name": settings.app_name,
        "status": "running",
        "docs": "/docs",
        "api_prefix": settings.api_v1_prefix,
    }


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Starting %s (env=%s, debug=%s)", settings.app_name, settings.app_env, settings.debug)
    if check_database_connection():
        logger.info("Database connection OK.")
    else:
        logger.warning(
            "Database connection FAILED at startup. The app will still boot, "
            "but every DB-backed endpoint will error until this is fixed."
        )
