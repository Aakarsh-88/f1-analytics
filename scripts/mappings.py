"""
Shared configuration mapping each source CSV file to its destination table.

This is the SINGLE source of truth for:
- which CSV file feeds which table
- how to rename that CSV's columns (source datasets use camelCase like
  `driverId`; our schema uses snake_case like `driver_id`)
- which columns need date/time parsing before insertion
- the import order tables must be loaded in, so every foreign key
  reference already exists by the time a child table is loaded

Both `validate_data.py` and `import_csv.py` import this module rather
than duplicating the mapping — if the CSV source ever changes column
names, this is the only file that needs to change.
"""

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(frozen=True)
class TableImportConfig:
    csv_filename: str
    table_name: str
    rename_map: Dict[str, str] = field(default_factory=dict)
    date_columns: List[str] = field(default_factory=list)
    time_columns: List[str] = field(default_factory=list)
    # Columns that are integers in the destination schema but may contain
    # missing values in the CSV. Without this, pandas silently upcasts
    # the whole column to float64 the moment it sees ANY missing value
    # (e.g. circuits.alt with one blank row turns 153 into 153.0), which
    # Postgres then rejects when inserting into an `integer` column.
    # These are cast to pandas' nullable "Int64" extension dtype instead,
    # which preserves whole numbers as real ints and missing values as NA.
    integer_columns: List[str] = field(default_factory=list)
    # Columns whose CSV values are 1-indexed foreign keys pointing at a
    # PARENT table that must already be loaded — used by validate_data.py
    # to check referential integrity before any database write happens.
    foreign_keys: Dict[str, str] = field(default_factory=dict)  # {column: "parent_table.column"}


# Order matters: every table appears AFTER every table it depends on.
IMPORT_ORDER: List[TableImportConfig] = [
    TableImportConfig(
        csv_filename="seasons.csv",
        table_name="seasons",
        rename_map={},
    ),
    TableImportConfig(
        csv_filename="circuits.csv",
        table_name="circuits",
        rename_map={"circuitId": "circuit_id", "circuitRef": "circuit_ref"},
        integer_columns=["alt"],
    ),
    TableImportConfig(
        csv_filename="status.csv",
        table_name="status",
        rename_map={"statusId": "status_id"},
    ),
    TableImportConfig(
        csv_filename="drivers.csv",
        table_name="drivers",
        rename_map={"driverId": "driver_id", "driverRef": "driver_ref"},
        date_columns=["dob"],
        integer_columns=["number"],
    ),
    TableImportConfig(
        csv_filename="constructors.csv",
        table_name="constructors",
        rename_map={"constructorId": "constructor_id", "constructorRef": "constructor_ref"},
    ),
    TableImportConfig(
        csv_filename="races.csv",
        table_name="races",
        rename_map={"raceId": "race_id", "circuitId": "circuit_id"},
        date_columns=["date", "fp1_date", "fp2_date", "fp3_date", "quali_date", "sprint_date"],
        time_columns=["time", "fp1_time", "fp2_time", "fp3_time", "quali_time", "sprint_time"],
        foreign_keys={"year": "seasons.year", "circuit_id": "circuits.circuit_id"},
    ),
    TableImportConfig(
        csv_filename="results.csv",
        table_name="results",
        rename_map={
            "resultId": "result_id",
            "raceId": "race_id",
            "driverId": "driver_id",
            "constructorId": "constructor_id",
            "positionText": "position_text",
            "positionOrder": "position_order",
            "fastestLap": "fastest_lap",
            "fastestLapTime": "fastest_lap_time",
            "fastestLapSpeed": "fastest_lap_speed",
            "statusId": "status_id",
        },
        foreign_keys={
            "race_id": "races.race_id",
            "driver_id": "drivers.driver_id",
            "constructor_id": "constructors.constructor_id",
            "status_id": "status.status_id",
        },
        integer_columns=["number", "position", "fastest_lap", "rank", "milliseconds"],
    ),
    TableImportConfig(
        csv_filename="lap_times.csv",
        table_name="lap_times",
        rename_map={"raceId": "race_id", "driverId": "driver_id"},
        foreign_keys={"race_id": "races.race_id", "driver_id": "drivers.driver_id"},
        integer_columns=["position", "milliseconds"],
    ),
    TableImportConfig(
        csv_filename="pit_stops.csv",
        table_name="pit_stops",
        rename_map={"raceId": "race_id", "driverId": "driver_id"},
        foreign_keys={"race_id": "races.race_id", "driver_id": "drivers.driver_id"},
        integer_columns=["milliseconds"],
    ),
    TableImportConfig(
        csv_filename="qualifying.csv",
        table_name="qualifying",
        rename_map={
            "qualifyId": "qualify_id",
            "raceId": "race_id",
            "driverId": "driver_id",
            "constructorId": "constructor_id",
        },
        foreign_keys={
            "race_id": "races.race_id",
            "driver_id": "drivers.driver_id",
            "constructor_id": "constructors.constructor_id",
        },
        integer_columns=["number", "position"],
    ),
    TableImportConfig(
        csv_filename="driver_standings.csv",
        table_name="driver_standings",
        rename_map={
            "driverStandingsId": "driver_standings_id",
            "raceId": "race_id",
            "driverId": "driver_id",
            "positionText": "position_text",
        },
        foreign_keys={"race_id": "races.race_id", "driver_id": "drivers.driver_id"},
        integer_columns=["position"],
    ),
    TableImportConfig(
        csv_filename="constructor_standings.csv",
        table_name="constructor_standings",
        rename_map={
            "constructorStandingsId": "constructor_standings_id",
            "raceId": "race_id",
            "constructorId": "constructor_id",
            "positionText": "position_text",
        },
        foreign_keys={"race_id": "races.race_id", "constructor_id": "constructors.constructor_id"},
        integer_columns=["position"],
    ),
    TableImportConfig(
        csv_filename="constructor_results.csv",
        table_name="constructor_results",
        rename_map={
            "constructorResultsId": "constructor_results_id",
            "raceId": "race_id",
            "constructorId": "constructor_id",
        },
        foreign_keys={"race_id": "races.race_id", "constructor_id": "constructors.constructor_id"},
    ),
]

# The Ergast-style F1 CSV export uses the literal string "\N" for NULL.
CSV_NULL_MARKERS = ["\\N", ""]
