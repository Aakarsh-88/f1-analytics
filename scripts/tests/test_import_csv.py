"""
Tests for scripts/import_csv.py's data transformation logic.

Covers the exact bug found and fixed during Milestone 4: pandas silently
upcasts an integer column to float64 the moment any row in it is blank
(e.g. circuits.alt), which would insert "153.0" instead of "153" into a
Postgres Integer column. These tests exist specifically to catch a
regression of that fix, not just to demonstrate the function works.
"""

from pathlib import Path

import pandas as pd
import pytest

from import_csv import load_and_transform_csv, parse_date_column, parse_time_column
from mappings import TableImportConfig


@pytest.fixture
def circuits_csv(tmp_path: Path) -> Path:
    csv_path = tmp_path / "circuits.csv"
    csv_path.write_text(
        "circuitId,circuitRef,name,location,country,lat,lng,alt,url\n"
        "1,silverstone,Silverstone Circuit,Silverstone,UK,52.0786,-1.01694,153,http://example.com/silverstone\n"
        "2,monza,Monza Circuit,Monza,Italy,45.6156,9.28111,\\N,http://example.com/monza\n"
    )
    return tmp_path


@pytest.fixture
def circuits_config() -> TableImportConfig:
    return TableImportConfig(
        csv_filename="circuits.csv",
        table_name="circuits",
        rename_map={"circuitId": "circuit_id", "circuitRef": "circuit_ref"},
        integer_columns=["alt"],
    )


def test_nullable_integer_column_stays_a_real_int_not_a_float(
    circuits_csv: Path, circuits_config: TableImportConfig
) -> None:
    """
    The regression this test guards against: without the Int64 cast,
    `alt` for Silverstone would come out as the float 153.0 instead of
    the int 153, purely because Monza's `alt` in the same column is
    blank elsewhere in the file.
    """
    df = load_and_transform_csv(circuits_csv, circuits_config)
    assert df is not None

    records = df.to_dict(orient="records")
    silverstone = next(r for r in records if r["circuit_ref"] == "silverstone")
    monza = next(r for r in records if r["circuit_ref"] == "monza")

    assert silverstone["alt"] == 153
    assert isinstance(silverstone["alt"], int)
    assert monza["alt"] is None


def test_missing_csv_file_returns_none_rather_than_raising(
    tmp_path: Path, circuits_config: TableImportConfig
) -> None:
    result = load_and_transform_csv(tmp_path, circuits_config)
    assert result is None


def test_rename_map_applied_correctly(circuits_csv: Path, circuits_config: TableImportConfig) -> None:
    df = load_and_transform_csv(circuits_csv, circuits_config)
    assert df is not None
    assert "circuit_id" in df.columns
    assert "circuit_ref" in df.columns
    assert "circuitId" not in df.columns


def test_parse_date_column_converts_iso_strings_to_date_objects() -> None:
    series = pd.Series(["1985-01-07", "1911-06-24", None])
    result = parse_date_column(series)

    assert result.iloc[0].isoformat() == "1985-01-07"
    assert result.iloc[1].isoformat() == "1911-06-24"
    assert pd.isna(result.iloc[2])


def test_parse_time_column_converts_hms_strings_to_time_objects() -> None:
    series = pd.Series(["14:00:00", None])
    result = parse_time_column(series)

    assert result.iloc[0].hour == 14
    assert pd.isna(result.iloc[1])


def test_date_and_time_parsing_produce_none_not_nan_after_full_transform(
    tmp_path: Path,
) -> None:
    """
    Exercises a races-shaped CSV with a blank date/time to confirm the
    full pipeline (parse -> NaT -> None conversion) ends with a real
    Python None in the final records, not NaT or NaN — psycopg2 does not
    treat those the same as SQL NULL.
    """
    races_config = TableImportConfig(
        csv_filename="races.csv",
        table_name="races",
        rename_map={"raceId": "race_id", "circuitId": "circuit_id"},
        date_columns=["date"],
        time_columns=["time"],
    )
    csv_path = tmp_path / "races.csv"
    csv_path.write_text(
        "raceId,year,round,circuitId,name,date,time\n"
        "1,2025,1,1,British Grand Prix,2025-07-06,14:00:00\n"
        "2,2025,2,2,Italian Grand Prix,2025-09-07,\\N\n"
    )

    df = load_and_transform_csv(tmp_path, races_config)
    assert df is not None

    records = df.to_dict(orient="records")
    assert records[1]["time"] is None
    assert records[0]["date"].isoformat() == "2025-07-06"
