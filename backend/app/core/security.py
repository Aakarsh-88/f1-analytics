"""
Authentication via Clerk JWTs.

STATUS: structural stub for Milestone 2.
Full implementation (JWKS fetching + signature verification + caching of
Clerk's public keys) lands in Milestone 6, once Clerk is configured on
the frontend and we have real tokens to test against.

Why the stub exists now rather than being added later:
- `get_current_user` is already referenced as a dependency type in
  `api/deps.py` so route signatures written from Milestone 2 onward
  don't need to change when auth is wired in — only this file's
  internals change.
- Right now, `get_current_user` is a NO-OP that returns an anonymous
  user object. No route in this project enforces auth until Milestone 6
  explicitly adds `Depends(require_auth)` to protected routes.
"""

import logging
from dataclasses import dataclass
from typing import Optional

from fastapi import Header

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class CurrentUser:
    """Represents the authenticated (or anonymous) requester."""

    user_id: Optional[str]
    is_authenticated: bool


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> CurrentUser:
    """
    FastAPI dependency returning the current user.

    Milestone 2 behavior: always returns an anonymous user, regardless of
    the Authorization header's contents. This lets every route declare
    `user: CurrentUser = Depends(get_current_user)` today without
    breaking anything once real verification is added.

    Milestone 6 behavior (to be implemented): parse the Bearer token,
    verify its signature against Clerk's JWKS (settings.clerk_jwks_url),
    and raise HTTP 401 on failure.
    """
    if not authorization or not settings.clerk_secret_key:
        return CurrentUser(user_id=None, is_authenticated=False)

    # Placeholder — real verification added in Milestone 6.
    logger.debug("Clerk verification not yet implemented; treating as anonymous.")
    return CurrentUser(user_id=None, is_authenticated=False)
