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
    assert Settings(app_env="production").is_production is True
    assert Settings(app_env="Production").is_production is True  # case-insensitive
    assert Settings(app_env="development").is_production is False
    assert Settings(app_env="staging").is_production is False


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
