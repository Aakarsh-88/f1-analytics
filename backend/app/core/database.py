"""
Database engine and session management (SQLAlchemy 2.0 style).

This module creates ONE engine for the lifetime of the process and hands
out short-lived sessions per request via the `get_db` dependency. Never
import `SessionLocal` directly in route handlers — always go through
`get_db` so sessions are guaranteed to close even if a request raises.
"""

import logging
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

# `pool_pre_ping` avoids "server closed the connection unexpectedly" errors
# that occur when a pooled connection has been idle longer than Postgres'
# timeout. `pool_size`/`max_overflow` are tuned for a small-to-medium app;
# revisit these numbers under real load testing.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.debug and not settings.is_production,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models (Milestone 3).

    Using SQLAlchemy 2.0's `DeclarativeBase` (instead of the legacy
    `declarative_base()` function) gives us proper typing support for
    `Mapped[...]` column annotations in every model file.
    """

    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session and guarantees
    it is closed after the request, even on exception.

    Usage in a route:
        def list_drivers(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_database_connection() -> bool:
    """
    Runs a trivial query to confirm the database is reachable.
    Used by the /health endpoint and at startup.
    """
    try:
        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")
        return True
    except Exception as exc:  # noqa: BLE001 — we want to catch and log any DB error here
        logger.error("Database connection check failed: %s", exc)
        return False
