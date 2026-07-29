"""Tests for scripts/validate_data.py."""

import pandas as pd

from mappings import TableImportConfig
from validate_data import check_columns, check_referential_integrity


def test_check_columns_passes_when_all_expected_columns_present() -> None:
    config = TableImportConfig(
        csv_filename="circuits.csv",
        table_name="circuits",
        rename_map={"circuitId": "circuit_id", "circuitRef": "circuit_ref"},
    )
    df = pd.DataFrame({"circuitId": [1], "circuitRef": ["silverstone"], "name": ["Silverstone"]})

    issues: list = []
    check_columns(df, config, issues)

    assert issues == []


def test_check_columns_reports_missing_rename_source_column() -> None:
    config = TableImportConfig(
        csv_filename="circuits.csv",
        table_name="circuits",
        rename_map={"circuitId": "circuit_id", "circuitRef": "circuit_ref"},
    )
    # Missing "circuitRef" entirely
    df = pd.DataFrame({"circuitId": [1], "name": ["Silverstone"]})

    issues: list = []
    check_columns(df, config, issues)

    assert len(issues) == 1
    assert "circuitRef" in issues[0]
    assert "circuits.csv" in issues[0]


def test_check_columns_reports_missing_date_column_not_covered_by_rename() -> None:
    config = TableImportConfig(
        csv_filename="drivers.csv",
        table_name="drivers",
        rename_map={"driverId": "driver_id"},
        date_columns=["dob"],
    )
    # "dob" is missing and isn't part of the rename map, so it must be
    # checked directly by its own (unrenamed) name.
    df = pd.DataFrame({"driverId": [1]})

    issues: list = []
    check_columns(df, config, issues)

    assert len(issues) == 1
    assert "dob" in issues[0]


def test_check_referential_integrity_passes_when_all_keys_exist() -> None:
    circuits_config = TableImportConfig(csv_filename="circuits.csv", table_name="circuits")
    races_config = TableImportConfig(
        csv_filename="races.csv",
        table_name="races",
        foreign_keys={"circuit_id": "circuits.circuit_id"},
    )

    dataframes = {
        "circuits": pd.DataFrame({"circuit_id": [1, 2, 3]}),
        "races": pd.DataFrame({"circuit_id": [1, 2, 2, 3]}),
    }

    issues: list = []
    check_referential_integrity(dataframes, races_config, issues)

    assert issues == []


def test_check_referential_integrity_detects_orphaned_foreign_key() -> None:
    races_config = TableImportConfig(
        csv_filename="races.csv",
        table_name="races",
        foreign_keys={"circuit_id": "circuits.circuit_id"},
    )

    dataframes = {
        "circuits": pd.DataFrame({"circuit_id": [1, 2, 3]}),
        # 999 does not exist in circuits — this is the orphan
        "races": pd.DataFrame({"circuit_id": [1, 2, 999]}),
    }

    issues: list = []
    check_referential_integrity(dataframes, races_config, issues)

    assert len(issues) == 1
    assert "races.circuit_id" in issues[0]
    assert "999" in issues[0]


def test_check_referential_integrity_ignores_null_foreign_keys() -> None:
    """
    A missing/null foreign key value (e.g. an optional relationship) is
    not the same as an orphaned reference — it should never be flagged.
    """
    races_config = TableImportConfig(
        csv_filename="races.csv",
        table_name="races",
        foreign_keys={"circuit_id": "circuits.circuit_id"},
    )

    dataframes = {
        "circuits": pd.DataFrame({"circuit_id": [1, 2]}),
        "races": pd.DataFrame({"circuit_id": [1, None, 2]}),
    }

    issues: list = []
    check_referential_integrity(dataframes, races_config, issues)

    assert issues == []
