"""
Sanity tests for the health check endpoint and root route.

These are deliberately the first tests in the project: if these fail,
nothing else (routers, middleware, exception handlers) is wired correctly,
so there is no point testing anything more specific yet.
"""

from fastapi.testclient import TestClient


def test_root_returns_200(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "running"
    assert "docs" in body


def test_health_endpoint_returns_expected_shape(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    body = response.json()
    assert "status" in body
    assert "database" in body
    assert "cache" in body
    assert body["status"] in {"ok", "degraded"}


def test_unknown_route_returns_404(client: TestClient) -> None:
    response = client.get("/api/v1/this-route-does-not-exist")
    assert response.status_code == 404
