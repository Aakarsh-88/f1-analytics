"""Tests for app.core.config.Settings."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_cors_origins_list_splits_and_strips_commas() -> None:
    settings = Settings(cors_origins="http://localhost:3000, http://127.0.0.1:3000 ,")
    assert settings.cors_origins_list == ["http://localhost:3000", "http://127.0.0.1:3000"]


def test_cors_origins_list_handles_single_origin() -> None:
    settings = Settings(cors_origins="http://localhost:3000")
    assert settings.cors_origins_list == ["http://localhost:3000"]


def test_is_production_true_only_for_production_env() -> None:
    production_settings = {
        "debug": False,
        "database_url": "postgresql://db.example.com:5432/f1",
        "cors_origins": "https://analytics.example.com",
    }
    assert Settings(app_env="production", **production_settings).is_production is True
    assert Settings(app_env="Production", **production_settings).is_production is True  # case-insensitive
    assert Settings(app_env="development").is_production is False
    assert Settings(app_env="staging").is_production is False


def test_production_rejects_debug_mode() -> None:
    with pytest.raises(ValidationError, match="DEBUG must be false"):
        Settings(
            app_env="production",
            database_url="postgresql://db.example.com:5432/f1",
            cors_origins="https://analytics.example.com",
        )


def test_production_rejects_localhost_cors() -> None:
    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        Settings(
            app_env="production",
            debug=False,
            database_url="postgresql://db.example.com:5432/f1",
            cors_origins="http://localhost:3000,http://127.0.0.1:3000",
        )


@pytest.mark.parametrize(
    "database_url",
    ["", "not-a-database-url", "postgresql://localhost"],
)
def test_production_rejects_invalid_database_url(database_url: str) -> None:
    with pytest.raises(ValidationError, match="DATABASE_URL"):
        Settings(
            app_env="production",
            debug=False,
            database_url=database_url,
            cors_origins="https://analytics.example.com",
        )


def test_development_defaults_remain_compatible() -> None:
    settings = Settings(app_env="development")
    assert settings.debug is True
    assert "http://localhost:3000" in settings.cors_origins_list


def test_log_level_is_uppercased() -> None:
    settings = Settings(log_level="debug")
    assert settings.log_level == "DEBUG"


def test_log_level_rejects_invalid_value() -> None:
    with pytest.raises(ValidationError):
        Settings(log_level="not-a-real-level")


def test_default_pagination_values() -> None:
    settings = Settings()
    assert settings.default_page_size == 25
    assert settings.max_page_size == 100
