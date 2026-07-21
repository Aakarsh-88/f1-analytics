-- =============================================================================
-- F1 Analytics — Reference Schema (PostgreSQL)
-- =============================================================================
-- This file is a human-readable reference. It is NOT executed directly by
-- the application — Alembic (backend/alembic/versions/0001_initial_schema.py)
-- is the source of truth that actually creates these tables. This file exists
-- so the schema can be reviewed, diffed, or handed to a DBA without needing
-- to read Python.
-- =============================================================================

-- --- Independent / lookup tables ---

CREATE TABLE seasons (
    year INTEGER PRIMARY KEY,
    url  VARCHAR(255)
);

CREATE TABLE circuits (
    circuit_id   SERIAL PRIMARY KEY,
    circuit_ref  VARCHAR(100) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    location     VARCHAR(255),
    country      VARCHAR(100),
    lat          NUMERIC(9, 6),
    lng          NUMERIC(9, 6),
    alt          INTEGER,
    url          VARCHAR(255)
);
CREATE INDEX ix_circuits_country ON circuits (country);

CREATE TABLE status (
    status_id SERIAL PRIMARY KEY,
    status    VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE drivers (
    driver_id    SERIAL PRIMARY KEY,
    driver_ref   VARCHAR(100) NOT NULL UNIQUE,
    number       INTEGER,
    code         VARCHAR(3),
    forename     VARCHAR(100) NOT NULL,
    surname      VARCHAR(100) NOT NULL,
    dob          DATE,
    nationality  VARCHAR(100),
    url          VARCHAR(255)
);
CREATE INDEX ix_drivers_nationality ON drivers (nationality);
CREATE INDEX ix_drivers_surname ON drivers (surname);

CREATE TABLE constructors (
    constructor_id   SERIAL PRIMARY KEY,
    constructor_ref  VARCHAR(100) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    nationality      VARCHAR(100),
    url              VARCHAR(255)
);
CREATE INDEX ix_constructors_nationality ON constructors (nationality);

-- --- Races (depends on seasons, circuits) ---

CREATE TABLE races (
    race_id     SERIAL PRIMARY KEY,
    year        INTEGER NOT NULL REFERENCES seasons (year),
    round       INTEGER NOT NULL,
    circuit_id  INTEGER NOT NULL REFERENCES circuits (circuit_id),
    name        VARCHAR(255) NOT NULL,
    date        DATE,
    time        TIME,
    url         VARCHAR(255),
    fp1_date    DATE,
    fp1_time    TIME,
    fp2_date    DATE,
    fp2_time    TIME,
    fp3_date    DATE,
    fp3_time    TIME,
    quali_date  DATE,
    quali_time  TIME,
    sprint_date DATE,
    sprint_time TIME
);
CREATE INDEX ix_races_year ON races (year);
CREATE INDEX ix_races_circuit_id ON races (circuit_id);
CREATE UNIQUE INDEX ix_races_year_round ON races (year, round);

-- --- Results (depends on races, drivers, constructors, status) ---

CREATE TABLE results (
    result_id         SERIAL PRIMARY KEY,
    race_id           INTEGER NOT NULL REFERENCES races (race_id),
    driver_id         INTEGER NOT NULL REFERENCES drivers (driver_id),
    constructor_id    INTEGER NOT NULL REFERENCES constructors (constructor_id),
    number            INTEGER,
    grid              INTEGER NOT NULL DEFAULT 0,
    position          INTEGER,
    position_text     VARCHAR(10),
    position_order    INTEGER NOT NULL,
    points            NUMERIC(6, 2) NOT NULL DEFAULT 0,
    laps              INTEGER NOT NULL DEFAULT 0,
    time              VARCHAR(20),
    milliseconds      INTEGER,
    fastest_lap       INTEGER,
    rank              INTEGER,
    fastest_lap_time  VARCHAR(20),
    fastest_lap_speed NUMERIC(7, 3),
    status_id         INTEGER NOT NULL REFERENCES status (status_id)
);
CREATE INDEX ix_results_race_id ON results (race_id);
CREATE INDEX ix_results_driver_id ON results (driver_id);
CREATE INDEX ix_results_constructor_id ON results (constructor_id);
CREATE INDEX ix_results_status_id ON results (status_id);
CREATE INDEX ix_results_driver_race ON results (driver_id, race_id);

-- --- Lap times (composite PK) ---

CREATE TABLE lap_times (
    race_id      INTEGER NOT NULL REFERENCES races (race_id),
    driver_id    INTEGER NOT NULL REFERENCES drivers (driver_id),
    lap          INTEGER NOT NULL,
    position     INTEGER,
    time         VARCHAR(20),
    milliseconds INTEGER,
    PRIMARY KEY (race_id, driver_id, lap)
);
CREATE INDEX ix_lap_times_driver_id ON lap_times (driver_id);

-- --- Pit stops (composite PK) ---

CREATE TABLE pit_stops (
    race_id      INTEGER NOT NULL REFERENCES races (race_id),
    driver_id    INTEGER NOT NULL REFERENCES drivers (driver_id),
    stop         INTEGER NOT NULL,
    lap          INTEGER NOT NULL,
    time         VARCHAR(20),
    duration     VARCHAR(20),
    milliseconds INTEGER,
    PRIMARY KEY (race_id, driver_id, stop)
);
CREATE INDEX ix_pit_stops_driver_id ON pit_stops (driver_id);

-- --- Qualifying (depends on races, drivers, constructors) ---

CREATE TABLE qualifying (
    qualify_id     SERIAL PRIMARY KEY,
    race_id        INTEGER NOT NULL REFERENCES races (race_id),
    driver_id      INTEGER NOT NULL REFERENCES drivers (driver_id),
    constructor_id INTEGER NOT NULL REFERENCES constructors (constructor_id),
    number         INTEGER,
    position       INTEGER,
    q1             VARCHAR(20),
    q2             VARCHAR(20),
    q3             VARCHAR(20)
);
CREATE INDEX ix_qualifying_race_id ON qualifying (race_id);
CREATE INDEX ix_qualifying_driver_id ON qualifying (driver_id);
CREATE INDEX ix_qualifying_constructor_id ON qualifying (constructor_id);

-- --- Driver standings (cumulative points after each race) ---

CREATE TABLE driver_standings (
    driver_standings_id SERIAL PRIMARY KEY,
    race_id             INTEGER NOT NULL REFERENCES races (race_id),
    driver_id           INTEGER NOT NULL REFERENCES drivers (driver_id),
    points              NUMERIC(6, 2) NOT NULL DEFAULT 0,
    position            INTEGER,
    position_text       VARCHAR(10),
    wins                INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX ix_driver_standings_race_id ON driver_standings (race_id);
CREATE INDEX ix_driver_standings_driver_id ON driver_standings (driver_id);
CREATE INDEX ix_driver_standings_driver_race ON driver_standings (driver_id, race_id);

-- --- Constructor standings (cumulative points after each race) ---

CREATE TABLE constructor_standings (
    constructor_standings_id SERIAL PRIMARY KEY,
    race_id                  INTEGER NOT NULL REFERENCES races (race_id),
    constructor_id           INTEGER NOT NULL REFERENCES constructors (constructor_id),
    points                   NUMERIC(6, 2) NOT NULL DEFAULT 0,
    position                 INTEGER,
    position_text            VARCHAR(10),
    wins                     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX ix_constructor_standings_race_id ON constructor_standings (race_id);
CREATE INDEX ix_constructor_standings_constructor_id ON constructor_standings (constructor_id);
CREATE INDEX ix_constructor_standings_constructor_race ON constructor_standings (constructor_id, race_id);

-- --- Constructor results (points scored in a single race) ---

CREATE TABLE constructor_results (
    constructor_results_id SERIAL PRIMARY KEY,
    race_id                INTEGER NOT NULL REFERENCES races (race_id),
    constructor_id         INTEGER NOT NULL REFERENCES constructors (constructor_id),
    points                 NUMERIC(6, 2) NOT NULL DEFAULT 0,
    status                 VARCHAR(100)
);
CREATE INDEX ix_constructor_results_race_id ON constructor_results (race_id);
CREATE INDEX ix_constructor_results_constructor_id ON constructor_results (constructor_id);
