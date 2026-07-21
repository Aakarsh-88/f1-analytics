"""
Alembic environment script.

The single most important line in this file is setting
`config.set_main_option("sqlalchemy.url", settings.database_url)` — it
means alembic.ini never needs a real connection string checked into git;
the actual URL always comes from our own Settings (which reads .env).
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Import Base + every model (via app.models) so `Base.metadata` is fully
# populated before Alembic compares it against the live database schema.
from app.core.config import settings
from app.core.database import Base
from app.models import *  # noqa: F401,F403 — required to register all tables

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Generates SQL scripts without a live DB connection (`alembic upgrade
    --sql`). Useful for handing a DBA a reviewable .sql file instead of
    running migrations directly against production.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Runs migrations with an active connection — the normal `alembic upgrade head` path."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
