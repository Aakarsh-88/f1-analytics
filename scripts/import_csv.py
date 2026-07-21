"""
Imports every F1 dataset CSV into PostgreSQL, in foreign-key dependency
order, using the shared config in mappings.py.

Usage:
    # From the backend/ virtualenv, run from the project root:
    python scripts/import_csv.py --data-dir scripts/data
    python scripts/import_csv.py --data-dir scripts/data --truncate   # wipe tables first
    python scripts/import_csv.py --data-dir scripts/data --only races,results

Design notes:
- Uses SQLAlchemy Core (`table.insert()` + `connection.execute(..., chunk)`)
  rather than the ORM. For a bulk load of millions of rows (lap_times
  alone is 500k+ rows in the full historical dataset), Core bulk inserts
  are dramatically faster than instantiating one ORM object per row.
- Each table is imported inside its own transaction (`engine.begin()`),
  so a failure partway through one CSV doesn't leave a different,
  already-completed table half-committed.
- NaN handling: pandas represents the source dataset's "\\N" nulls as
  NaN after `read_csv(na_values=...)`. `df.astype(object).where(pd.notnull(df), None)`
  converts the WHOLE frame to Python objects first, which is what
  guarantees NaN becomes a real `None` even in a column that pandas
  would otherwise keep as float64 — the naive `df.where(...)` without
  the `astype(object)` step leaves NaN (a float) in place for numeric
  columns, which psycopg2 does NOT treat the same as SQL NULL.
"""

import argparse
import sys
import time
from pathlib import Path
from typing import List, Optional

import pandas as pd
from sqlalchemy import MetaData, Table, create_engine, text
from sqlalchemy.engine import Engine

# Allow running this script directly (`python scripts/import_csv.py`) by
# adding both the project root and backend/ to the path, since it needs
# to import both `mappings` (sibling file) and `app.core.config` (backend).
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from mappings import CSV_NULL_MARKERS, IMPORT_ORDER, TableImportConfig  # noqa: E402

from app.core.config import settings  # noqa: E402


CHUNK_SIZE = 5000


def parse_date_column(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce").dt.date


def parse_time_column(series: pd.Series) -> pd.Series:
    """
    Parses "HH:MM:SS" strings into datetime.time objects. Invalid or
    missing values become NaT, which the later NaN->None pass converts
    to a real SQL NULL.
    """
    parsed = pd.to_datetime(series, format="%H:%M:%S", errors="coerce")
    return parsed.dt.time


def load_and_transform_csv(data_dir: Path, config: TableImportConfig) -> Optional[pd.DataFrame]:
    path = data_dir / config.csv_filename
    if not path.exists():
        print(f"  ! Skipping {config.csv_filename} — file not found at {path}")
        return None

    df = pd.read_csv(path, na_values=CSV_NULL_MARKERS, keep_default_na=True, low_memory=False)
    df = df.rename(columns=config.rename_map)

    # Cast BEFORE the NaN->None pass below: pandas' nullable "Int64"
    # dtype must be applied while the column can still tell a missing
    # value (NaN) apart from a present one, so 153 stays the integer 153
    # instead of silently becoming 153.0 because some OTHER row in the
    # same column was blank.
    for col in config.integer_columns:
        if col in df.columns:
            df[col] = df[col].astype("Int64")

    for col in config.date_columns:
        if col in df.columns:
            df[col] = parse_date_column(df[col])

    for col in config.time_columns:
        if col in df.columns:
            df[col] = parse_time_column(df[col])

    # Convert the ENTIRE frame to Python objects so NaN/NaT reliably
    # becomes None for every column, regardless of pandas' inferred dtype.
    df = df.astype(object).where(pd.notnull(df), None)

    return df


def insert_dataframe(engine: Engine, table: Table, df: pd.DataFrame, table_name: str) -> int:
    records = df.to_dict(orient="records")
    total = len(records)

    with engine.begin() as connection:
        for start in range(0, total, CHUNK_SIZE):
            chunk = records[start : start + CHUNK_SIZE]
            connection.execute(table.insert(), chunk)
            print(f"    inserted {min(start + CHUNK_SIZE, total):,}/{total:,} rows", end="\r")

    print(f"    inserted {total:,}/{total:,} rows" + " " * 10)
    return total


def truncate_all_tables(engine: Engine, table_names: List[str]) -> None:
    """
    TRUNCATE ... CASCADE handles FK dependency order automatically
    (unlike DELETE), so table order doesn't matter here — but we still
    pass every table in a single statement so it's one atomic operation.
    """
    with engine.begin() as connection:
        joined = ", ".join(table_names)
        connection.execute(text(f"TRUNCATE TABLE {joined} RESTART IDENTITY CASCADE"))
    print(f"Truncated {len(table_names)} tables.\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import F1 dataset CSVs into PostgreSQL.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).parent / "data",
        help="Directory containing the source CSV files (default: scripts/data)",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate all target tables before importing (use for a clean re-import)",
    )
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Comma-separated list of table names to import (default: all, in dependency order)",
    )
    args = parser.parse_args()

    only_tables = set(args.only.split(",")) if args.only else None
    configs = [c for c in IMPORT_ORDER if only_tables is None or c.table_name in only_tables]

    if not configs:
        print(f"No matching tables for --only '{args.only}'. Nothing to do.")
        return 1

    engine = create_engine(settings.database_url, future=True)
    metadata = MetaData()
    metadata.reflect(bind=engine, only=[c.table_name for c in configs])

    if args.truncate:
        truncate_all_tables(engine, [c.table_name for c in configs])

    print(f"Importing {len(configs)} table(s) from {args.data_dir}\n")
    start_time = time.perf_counter()
    summary = []

    for config in configs:
        print(f"→ {config.table_name}")
        df = load_and_transform_csv(args.data_dir, config)
        if df is None:
            summary.append((config.table_name, 0, "skipped (file missing)"))
            continue

        table = metadata.tables[config.table_name]
        try:
            row_count = insert_dataframe(engine, table, df, config.table_name)
            summary.append((config.table_name, row_count, "ok"))
        except Exception as exc:  # noqa: BLE001 — we want to report and continue to next table
            print(f"    ERROR importing {config.table_name}: {exc}")
            summary.append((config.table_name, 0, f"FAILED: {exc}"))

    elapsed = time.perf_counter() - start_time

    print("\n" + "=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    for table_name, row_count, status in summary:
        print(f"  {table_name:<28} {row_count:>10,} rows   {status}")
    print("=" * 60)
    print(f"Completed in {elapsed:.1f}s\n")

    failures = [s for s in summary if "FAILED" in s[2]]
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
