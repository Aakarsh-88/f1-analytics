"""
Tests for app.core.security.

NOTE ON SCOPE: this backend's `get_current_user` is still the
structural stub described in its own docstring — real Clerk JWT
verification was implemented in the FRONTEND (`frontend/src/lib/auth/`)
during Milestone 6, but this backend stub was never updated to actually
verify tokens server-side. These tests cover the stub's real, current
behavior (always anonymous) rather than pretending JWT verification
exists here — that's a real gap worth flagging for a future milestone,
not something to paper over with tests for behavior that doesn't exist.
"""

import pytest

from app.core.security import CurrentUser, get_current_user


@pytest.mark.asyncio
async def test_returns_anonymous_when_no_authorization_header() -> None:
    user = await get_current_user(authorization=None)

    assert user == CurrentUser(user_id=None, is_authenticated=False)


@pytest.mark.asyncio
async def test_returns_anonymous_even_with_a_bearer_token_present() -> None:
    """
    Documents the CURRENT (stub) behavior precisely: a Bearer token is
    accepted as a parameter but not verified in any way, so it still
    resolves to an anonymous user. This test exists specifically so a
    future PR that adds real verification here changes this test's
    expected result — a silent behavior change would otherwise be easy
    to miss.
    """
    user = await get_current_user(authorization="Bearer some.fake.jwt")

    assert user.is_authenticated is False
    assert user.user_id is None
