"""
Shared pytest fixtures for the backend test suite.

`client` gives every test a ready-to-use FastAPI TestClient without
needing a real running server — requests are dispatched in-process.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)
