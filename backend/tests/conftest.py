"""
Shared pytest fixtures for the backend test suite.

`client` gives every test a ready-to-use FastAPI TestClient without
needing a real running server — requests are dispatched in-process.

`db_session` / `client_with_db` (added for endpoints that actually
query the database) spin up a fresh in-memory SQLite database per test,
using the REAL SQLAlchemy models from app.models — this exercises the
actual aggregation SQL in driver_repository.py, not a mocked stand-in.
SQLite rather than a real Postgres instance so these tests run without
any external service, per the project's "no network dependencies in
tests" requirement from Milestone 8.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 - populates Base.metadata with every table
from app.core.database import Base, get_db
from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client_with_db(db_session):
    """A TestClient whose get_db dependency is overridden to use the
    in-memory SQLite session above, instead of the real Postgres
    connection app.main normally configures."""

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
