"""
Custom application exceptions.

Why not just raise `HTTPException` everywhere: these domain-specific
exceptions can be raised from the `services/` and `repositories/` layers,
which have no business knowing about HTTP status codes. `main.py`
registers exception handlers that translate each of these into the
correct HTTP response at the edge of the application — keeping business
logic fully decoupled from the web framework.
"""

from typing import Any, Optional


class AppException(Exception):
    """Base class for all custom application exceptions."""

    status_code: int = 500
    error_code: str = "internal_error"

    def __init__(self, message: str, details: Optional[Any] = None) -> None:
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundException(AppException):
    """Raised when a requested resource (driver, race, constructor...) doesn't exist."""

    status_code = 404
    error_code = "not_found"


class ValidationException(AppException):
    """Raised for domain-level validation failures not caught by Pydantic."""

    status_code = 422
    error_code = "validation_error"


class BadRequestException(AppException):
    """Raised for malformed or logically invalid requests (e.g. bad filter combos)."""

    status_code = 400
    error_code = "bad_request"


class UnauthorizedException(AppException):
    """Raised when authentication is required but missing or invalid."""

    status_code = 401
    error_code = "unauthorized"


class ForbiddenException(AppException):
    """Raised when the authenticated user lacks permission for the action."""

    status_code = 403
    error_code = "forbidden"


class ConflictException(AppException):
    """Raised on unique-constraint violations or conflicting state changes."""

    status_code = 409
    error_code = "conflict"


class ServiceUnavailableException(AppException):
    """Raised when a downstream dependency (DB, cache) is unreachable."""

    status_code = 503
    error_code = "service_unavailable"
