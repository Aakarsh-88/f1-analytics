"""
Pre-import validation.

Run this BEFORE import_csv.py. It catches the two classes of problem
that are much cheaper to find here than mid-import:

1. Missing files / missing expected columns (a renamed or re-exported
   CSV is the most common real-world cause of import failures).
2. Referential integrity violations WITHIN the CSVs themselves — e.g. a
   row in races.csv pointing at a circuitId that doesn't exist in
   circuits.csv. If a real database FK constraint catches this instead,
   the whole import transaction for that table aborts partway through;
   catching it here means we know exactly which rows are bad before any
   data has moved.

Usage:
    python scripts/validate_data.py --data-dir scripts/data
    python scripts/validate_data.py --data-dir scripts/data --strict   # exit 1 on any issue
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, Set

import pandas as pd

from mappings import CSV_NULL_MARKERS, IMPORT_ORDER, TableImportConfig


def load_raw_csv(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, na_values=CSV_NULL_MARKERS, keep_default_na=True, low_memory=False)


def check_file_exists(data_dir: Path, config: TableImportConfig, issues: list) -> bool:
    path = data_dir / config.csv_filename
    if not path.exists():
        issues.append(f"[MISSING FILE] {config.csv_filename} not found in {data_dir}")
        return False
    return True


def check_columns(df: pd.DataFrame, config: TableImportConfig, issues: list) -> None:
    """Confirms every column the rename_map/date/time config expects actually exists."""
    expected_source_columns = (
        set(config.rename_map.keys())
        | set(config.date_columns) - set(config.rename_map.values())
        | set(config.time_columns) - set(config.rename_map.values())
    )
    # date/time columns are referenced by their POST-rename name in mappings.py
    # only when they weren't renamed (e.g. races.csv's fp1_date is not renamed).
    missing = [col for col in expected_source_columns if col not in df.columns]
    if missing:
        issues.append(
            f"[MISSING COLUMNS] {config.csv_filename} is missing expected columns: {missing}"
        )


def check_referential_integrity(
    dataframes: Dict[str, pd.DataFrame],
    config: TableImportConfig,
    issues: list,
) -> None:
    """
    For each declared foreign key, confirms every non-null value in the
    child column exists in the parent table's key column. Parent
    dataframes are looked up by table name in the already-loaded
    `dataframes` dict (populated as each table is validated, in the same
    dependency order used for import).
    """
    df = dataframes[config.table_name]

    for child_column, parent_ref in config.foreign_keys.items():
        parent_table, parent_column = parent_ref.split(".")
        if parent_table not in dataframes:
            continue  # parent wasn't loaded (e.g. its file was missing) — already reported

        parent_df = dataframes[parent_table]
        if parent_column not in parent_df.columns or child_column not in df.columns:
            continue  # column-mismatch already reported by check_columns

        valid_keys: Set = set(parent_df[parent_column].dropna().unique())
        child_values = df[child_column].dropna()
        orphans = child_values[~child_values.isin(valid_keys)]

        if not orphans.empty:
            sample = orphans.unique()[:10].tolist()
            issues.append(
                f"[ORPHANED FK] {config.table_name}.{child_column} has "
                f"{orphans.nunique()} distinct value(s) not present in "
                f"{parent_table}.{parent_column}. Sample: {sample}"
            )


def apply_rename_for_validation(df: pd.DataFrame, config: TableImportConfig) -> pd.DataFrame:
    """Renames columns so FK checks can compare using our DB-side column names."""
    return df.rename(columns=config.rename_map)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate F1 CSV files before import.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).parent / "data",
        help="Directory containing the source CSV files (default: scripts/data)",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with status 1 if any issue is found (default: report only)",
    )
    args = parser.parse_args()

    issues: list = []
    dataframes: Dict[str, pd.DataFrame] = {}

    print(f"Validating CSV files in: {args.data_dir}\n")

    for config in IMPORT_ORDER:
        if not check_file_exists(args.data_dir, config, issues):
            continue

        df = load_raw_csv(args.data_dir / config.csv_filename)
        check_columns(df, config, issues)

        renamed_df = apply_rename_for_validation(df, config)
        dataframes[config.table_name] = renamed_df

        check_referential_integrity(dataframes, config, issues)

        print(f"  ✓ checked {config.csv_filename:<28} ({len(df):,} rows)")

    print()
    if issues:
        print(f"Found {len(issues)} issue(s):\n")
        for issue in issues:
            print(f"  - {issue}")
        print()
        if args.strict:
            print("Exiting with status 1 (--strict mode).")
            return 1
        else:
            print("Re-run with --strict to fail the build on these issues.")
            return 0
    else:
        print("No issues found. Safe to run import_csv.py.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
