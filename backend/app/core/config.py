"""
Centralized application configuration.

All environment variables are declared here as typed fields. This is the
ONLY place in the codebase that should ever call `os.environ` (indirectly,
via pydantic-settings). Every other module imports `settings` from here.

Why this matters:
- Typos in env var names fail loudly at startup instead of silently
  returning None deep inside a request handler.
- Type coercion (e.g. "true" -> True, "300" -> 300) happens once, centrally.
- Swapping config sources (e.g. AWS Secrets Manager) later only touches
  this file.
"""

from functools import lru_cache
from typing import List
from urllib.parse import urlparse

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    app_name: str = Field(default="F1 Analytics API")
    app_env: str = Field(default="development")
    debug: bool = Field(default=True)
    api_v1_prefix: str = Field(default="/api/v1")

    # --- Server ---
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # --- Database ---
    database_url: str = Field(
        default="postgresql+psycopg://f1admin:changeme@localhost:5432/f1_analytics"
    )

    # --- CORS ---
    cors_origins: str = Field(default="http://localhost:3000")

    # --- Cache ---
    cache_enabled: bool = Field(default=True)
    redis_url: str = Field(default="redis://localhost:6379/0")
    cache_ttl_seconds: int = Field(default=300)

    # --- Auth (Clerk) ---
    clerk_secret_key: str = Field(default="")
    clerk_publishable_key: str = Field(default="")
    clerk_jwks_url: str = Field(default="")

    # --- Logging ---
    log_level: str = Field(default="INFO")
    log_json: bool = Field(default=False)

    # --- Pagination ---
    default_page_size: int = Field(default=25)
    max_page_size: int = Field(default=100)

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"log_level must be one of {allowed}, got '{v}'")
        return upper

    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        if not self.is_production:
            return self

        if self.debug:
            raise ValueError("DEBUG must be false when APP_ENV=production")

        origins = self.cors_origins_list
        development_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
        if not origins or set(origins).issubset(development_origins):
            raise ValueError(
                "CORS_ORIGINS must contain a non-localhost origin when APP_ENV=production"
            )

        parsed_database_url = urlparse(self.database_url)
        if (
            not self.database_url.strip()
            or parsed_database_url.scheme not in {"postgresql", "postgresql+psycopg2"}
            or not parsed_database_url.hostname
            or not parsed_database_url.path.strip("/")
        ):
            raise ValueError(
                "DATABASE_URL must be a valid PostgreSQL URL when APP_ENV=production"
            )

        return self

    @property
    def cors_origins_list(self) -> List[str]:
        """Split the comma-separated CORS_ORIGINS env var into a clean list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.

    `lru_cache` ensures the .env file is parsed exactly once per process,
    not on every request — this is a meaningful performance win since
    Settings() is used as a FastAPI dependency almost everywhere.
    """
    return Settings()


# Convenience singleton for modules that just need `from app.core.config import settings`
settings = get_settings()
