"""
Logging configuration.

Two modes:
- Human-readable text logs for local development (LOG_JSON=false).
- Structured JSON logs for production (LOG_JSON=true), so logs can be
  ingested by CloudWatch/Datadog/ELK without a separate parser.
"""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def configure_logging() -> None:
    """Call once at application startup (see app/main.py)."""
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level)

    # Remove any default handlers to avoid duplicate log lines on reload
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if settings.log_json:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )

    root_logger.addHandler(handler)

    # Quiet down noisy third-party loggers unless we're debugging
    if settings.log_level != "DEBUG":
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
