"""
Caching layer backed by Redis.

Why cache at all: analytics endpoints (season dominance, career stats,
championship progression) run non-trivial pandas/SQL aggregations over
75+ years of F1 data. Most of that data is immutable (a 1962 race result
never changes), so caching aggressively is safe and high-value.

Design choices:
- The cache is OPTIONAL. If Redis is unreachable or CACHE_ENABLED=false,
  every `cache_get` returns None and every `cache_set` is a no-op — the
  app must keep working with a cold cache, never crash because Redis
  is down. Caching is a performance optimization, not a dependency.
- Keys are plain strings built by callers (e.g. "driver:stats:hamilton"),
  values are JSON-serialized before storage.
"""

import json
import logging
from typing import Any, Optional

import redis
from redis.exceptions import RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """
    Lazily creates and returns a singleton Redis client.
    Returns None if caching is disabled or the client can't be created.
    """
    global _redis_client

    if not settings.cache_enabled:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
        except RedisError as exc:
            logger.warning("Could not initialize Redis client: %s", exc)
            return None

    return _redis_client


def cache_get(key: str) -> Optional[Any]:
    """Fetch and JSON-decode a cached value. Returns None on any failure."""
    client = get_redis_client()
    if client is None:
        return None

    try:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except (RedisError, json.JSONDecodeError) as exc:
        logger.warning("Cache GET failed for key '%s': %s", key, exc)
        return None


def cache_set(key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
    """JSON-encode and store a value with a TTL. Returns False on any failure."""
    client = get_redis_client()
    if client is None:
        return False

    ttl = ttl_seconds if ttl_seconds is not None else settings.cache_ttl_seconds

    try:
        client.set(key, json.dumps(value), ex=ttl)
        return True
    except (RedisError, TypeError) as exc:
        logger.warning("Cache SET failed for key '%s': %s", key, exc)
        return False


def cache_delete(key: str) -> bool:
    """Remove a cached value (e.g. after an admin data refresh)."""
    client = get_redis_client()
    if client is None:
        return False

    try:
        client.delete(key)
        return True
    except RedisError as exc:
        logger.warning("Cache DELETE failed for key '%s': %s", key, exc)
        return False


def check_cache_connection() -> bool:
    """Used by the /health endpoint to report cache status (non-fatal if down)."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.ping())
    except RedisError:
        return False
