"""
Integration tests for the Standings API.

Seed: two seasons.
  2022 - one race, Leclerc/Ferrari wins - exists only to prove the
         "default to the LATEST season when none is specified" behavior
         doesn't accidentally pick this one.
  2023 - three races, three drivers (Verstappen/RedBull, Leclerc/Ferrari,
         Perez/RedBull), with deliberately increasing cumulative points
         each round, so progression pivoting and "final standings = last
         race" selection are both meaningfully exercised (not just
         trivially correct because there's only one race to pick).

2023 constructor_standings points are deliberately LOWER in rounds 1-2
than round 3, specifically to catch a bug where the query might
accidentally sum across rounds instead of reading only the last one.
"""

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.constructor_standing import ConstructorStanding
from app.models.driver import Driver
from app.models.driver_standing import DriverStanding
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_standings_dataset(db: Session) -> None:
    db.add_all([Season(year=2022), Season(year=2023)])
    db.add(Circuit(circuit_id=1, circuit_ref="silverstone", name="Silverstone Circuit"))
    db.add(Constructor(constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing"))
    db.add(Constructor(constructor_id=2, constructor_ref="ferrari", name="Ferrari"))
    db.add(Driver(driver_id=1, driver_ref="verstappen", forename="Max", surname="Verstappen", code="VER"))
    db.add(Driver(driver_id=2, driver_ref="leclerc", forename="Charles", surname="Leclerc", code="LEC"))
    db.add(Driver(driver_id=3, driver_ref="perez", forename="Sergio", surname="Perez", code="PER"))
    db.add(Status(status_id=1, status="Finished"))
    db.flush()

    # --- 2022: single race, Leclerc wins - the "wrong" season if default logic breaks ---
    db.add(Race(race_id=100, year=2022, round=1, circuit_id=1, name="2022 Only Race"))
    db.flush()
    db.add(
        Result(
            result_id=100, race_id=100, driver_id=2, constructor_id=2, grid=1, position=1,
            position_text="1", position_order=1, points=25, laps=57, status_id=1,
        )
    )
    db.add(DriverStanding(driver_standings_id=100, race_id=100, driver_id=2, points=25, position=1, wins=1))
    db.add(ConstructorStanding(constructor_standings_id=100, race_id=100, constructor_id=2, points=25, position=1, wins=1))

    # --- 2023: three races, three drivers ---
    db.add_all(
        [
            Race(race_id=1, year=2023, round=1, circuit_id=1, name="Bahrain"),
            Race(race_id=2, year=2023, round=2, circuit_id=1, name="Saudi Arabia"),
            Race(race_id=3, year=2023, round=3, circuit_id=1, name="Australia"),
        ]
    )
    db.flush()

    # Results establish who drove for whom at each race (needed since
    # driver_standings has no constructor_id of its own).
    def result(rid, race_id, driver_id, constructor_id, position):
        return Result(
            result_id=rid, race_id=race_id, driver_id=driver_id, constructor_id=constructor_id,
            grid=position, position=position, position_text=str(position), position_order=position,
            points=0, laps=57, status_id=1,
        )

    db.add_all(
        [
            result(1, 1, 1, 1, 1), result(2, 1, 2, 2, 2), result(3, 1, 3, 1, 3),
            result(4, 2, 1, 1, 1), result(5, 2, 2, 2, 2), result(6, 2, 3, 1, 3),
            result(7, 3, 1, 1, 1), result(8, 3, 2, 2, 2), result(9, 3, 3, 1, 3),
        ]
    )

    db.add_all(
        [
            DriverStanding(driver_standings_id=1, race_id=1, driver_id=1, points=25, position=1, wins=1),
            DriverStanding(driver_standings_id=2, race_id=1, driver_id=2, points=18, position=2, wins=0),
            DriverStanding(driver_standings_id=3, race_id=1, driver_id=3, points=15, position=3, wins=0),
            DriverStanding(driver_standings_id=4, race_id=2, driver_id=1, points=50, position=1, wins=2),
            DriverStanding(driver_standings_id=5, race_id=2, driver_id=2, points=36, position=2, wins=0),
            DriverStanding(driver_standings_id=6, race_id=2, driver_id=3, points=30, position=3, wins=0),
            DriverStanding(driver_standings_id=7, race_id=3, driver_id=1, points=75, position=1, wins=3),
            DriverStanding(driver_standings_id=8, race_id=3, driver_id=2, points=54, position=2, wins=0),
            DriverStanding(driver_standings_id=9, race_id=3, driver_id=3, points=45, position=3, wins=0),
        ]
    )

    db.add_all(
        [
            ConstructorStanding(constructor_standings_id=1, race_id=1, constructor_id=1, points=40, position=1, wins=1),
            ConstructorStanding(constructor_standings_id=2, race_id=1, constructor_id=2, points=18, position=2, wins=0),
            ConstructorStanding(constructor_standings_id=3, race_id=2, constructor_id=1, points=80, position=1, wins=2),
            ConstructorStanding(constructor_standings_id=4, race_id=2, constructor_id=2, points=36, position=2, wins=0),
            ConstructorStanding(constructor_standings_id=5, race_id=3, constructor_id=1, points=120, position=1, wins=3),
            ConstructorStanding(constructor_standings_id=6, race_id=3, constructor_id=2, points=54, position=2, wins=0),
        ]
    )
    db.commit()


class TestStandings:
    def test_explicit_season_returns_final_standings(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings", params={"season": 2023})

        assert response.status_code == 200
        body = response.json()
        assert body["season"] == 2023

        driver_standings = body["driverStandings"]
        assert len(driver_standings) == 3
        assert driver_standings[0] == {
            "position": 1, "driverName": "Max Verstappen", "driverCode": "VER",
            "constructorName": "Red Bull Racing", "constructorRef": "red_bull", "points": 75.0, "wins": 3,
        }
        assert driver_standings[1]["driverName"] == "Charles Leclerc"
        assert driver_standings[2]["driverName"] == "Sergio Perez"

    def test_constructor_standings_use_the_last_race_not_an_earlier_one(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings", params={"season": 2023})
        constructor_standings = response.json()["constructorStandings"]

        # Round 3's cumulative values (120/54), NOT round 1's (40/18) or round 2's (80/36).
        assert constructor_standings[0] == {
            "position": 1, "constructorName": "Red Bull Racing", "constructorRef": "red_bull",
            "points": 120.0, "wins": 3,
        }
        assert constructor_standings[1]["points"] == 54.0

    def test_progression_has_one_row_per_round_with_correct_cumulative_points(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings", params={"season": 2023})
        body = response.json()

        assert body["progressionDriverCodes"] == ["VER", "LEC", "PER"]
        progression = body["progression"]
        assert len(progression) == 3

        assert progression[0] == {"round": 1, "raceName": "Bahrain", "VER": 25.0, "LEC": 18.0, "PER": 15.0}
        assert progression[1] == {"round": 2, "raceName": "Saudi Arabia", "VER": 50.0, "LEC": 36.0, "PER": 30.0}
        assert progression[2] == {"round": 3, "raceName": "Australia", "VER": 75.0, "LEC": 54.0, "PER": 45.0}

    def test_no_season_param_defaults_to_the_latest_season(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings")

        assert response.status_code == 200
        # Must be 2023 (the latest), not 2022 (the only-other season, which
        # exists specifically to catch a wrong "first season found" bug).
        assert response.json()["season"] == 2023
        assert response.json()["driverStandings"][0]["driverName"] == "Max Verstappen"

    def test_2022_season_returns_its_own_distinct_standings(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings", params={"season": 2022})
        body = response.json()

        assert body["season"] == 2022
        assert len(body["driverStandings"]) == 1
        assert body["driverStandings"][0]["driverName"] == "Charles Leclerc"

    def test_returns_404_for_a_season_with_no_races(self, db_session, client_with_db):
        seed_standings_dataset(db_session)

        response = client_with_db.get("/api/v1/standings", params={"season": 1999})

        assert response.status_code == 404
        assert response.json()["error_code"] == "not_found"
