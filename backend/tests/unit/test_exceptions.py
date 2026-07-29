"""
Tests for app.utils.exceptions.

Covers both the exception classes themselves (status codes, error codes)
and their end-to-end behavior through main.py's registered exception
handler, using a temporary test-only route so we don't depend on any
real feature route raising one of these.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app
from app.utils.exceptions import (
    AppException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    ServiceUnavailableException,
    UnauthorizedException,
    ValidationException,
)


@pytest.mark.parametrize(
    "exc_class,expected_status,expected_code",
    [
        (NotFoundException, 404, "not_found"),
        (ValidationException, 422, "validation_error"),
        (BadRequestException, 400, "bad_request"),
        (UnauthorizedException, 401, "unauthorized"),
        (ForbiddenException, 403, "forbidden"),
        (ConflictException, 409, "conflict"),
        (ServiceUnavailableException, 503, "service_unavailable"),
    ],
)
def test_exception_classes_carry_correct_status_and_error_code(
    exc_class: type[AppException], expected_status: int, expected_code: str
) -> None:
    exc = exc_class("something went wrong")
    assert exc.status_code == expected_status
    assert exc.error_code == expected_code
    assert exc.message == "something went wrong"
    assert exc.details is None


def test_exception_carries_optional_details() -> None:
    exc = ValidationException("bad field", details={"field": "email"})
    assert exc.details == {"field": "email"}


def test_app_exception_handler_returns_consistent_json_shape() -> None:
    """
    Registers a temporary route on the real `app` that raises
    NotFoundException, confirming main.py's exception handler converts
    it into the documented `{error_code, message, details}` JSON shape
    with the right HTTP status — exactly what a real feature route
    (once built) would produce.
    """

    @app.get("/__test_only_not_found")
    def _raise_not_found():
        raise NotFoundException("driver not found", details={"driver_id": 999})

    client = TestClient(app)
    response = client.get("/__test_only_not_found")

    assert response.status_code == 404
    body = response.json()
    assert body == {
        "error_code": "not_found",
        "message": "driver not found",
        "details": {"driver_id": 999},
    }

    # Clean up the temporary route so it doesn't leak into other tests
    # that might enumerate app.routes.
    app.router.routes = [
        r for r in app.router.routes if getattr(r, "path", None) != "/__test_only_not_found"
    ]


def test_unhandled_exception_returns_generic_500_without_leaking_traceback() -> None:
    @app.get("/__test_only_unhandled")
    def _raise_unhandled():
        raise RuntimeError("some internal bug")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/__test_only_unhandled")

    assert response.status_code == 500
    body = response.json()
    assert body["error_code"] == "internal_error"
    # The real exception message must never leak to the client.
    assert "some internal bug" not in body["message"]

    app.router.routes = [
        r for r in app.router.routes if getattr(r, "path", None) != "/__test_only_unhandled"
    ]
