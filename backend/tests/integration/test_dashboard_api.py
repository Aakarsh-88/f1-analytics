"""
Integration tests for the Dashboard API.

Two scenarios:
  - An empty database: everything should be zeros/empty arrays, 200 OK
    (not a 404 - see dashboard_service.py's docstring on why).
  - A seeded database across 3 seasons with a clear "most recent race":
    verifies totals, per-season race counts, and that the podium comes
    from the CORRECT (most recent) race, not an earlier one, with
    positions/names/points all correct.
"""

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_dashboard_dataset(db: Session) -> None:
    db.add_all([Season(year=2021), Season(year=2022), Season(year=2023)])
    db.add(Status(status_id=1, status="Finished"))
    db.add(Circuit(circuit_id=1, circuit_ref="silverstone", name="Silverstone Circuit"))
    db.add(Constructor(constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing"))
    db.add(Constructor(constructor_id=2, constructor_ref="ferrari", name="Ferrari"))
    db.add(Constructor(constructor_id=3, constructor_ref="mercedes", name="Mercedes"))
    db.add(Driver(driver_id=1, driver_ref="verstappen", forename="Max", surname="Verstappen"))
    db.add(Driver(driver_id=2, driver_ref="leclerc", forename="Charles", surname="Leclerc"))
    db.add(Driver(driver_id=3, driver_ref="hamilton", forename="Lewis", surname="Hamilton"))
    db.add(Driver(driver_id=4, driver_ref="perez", forename="Sergio", surname="Perez"))
    db.flush()

    # 2021: 2 races, 2022: 1 race, 2023: 1 race (the MOST recent - round 1)
    db.add_all(
        [
            Race(race_id=1, year=2021, round=1, circuit_id=1, name="2021 Race 1"),
            Race(race_id=2, year=2021, round=2, circuit_id=1, name="2021 Race 2"),
            Race(race_id=3, year=2022, round=1, circuit_id=1, name="2022 Race 1"),
            Race(race_id=4, year=2023, round=1, circuit_id=1, name="Latest Grand Prix"),
        ]
    )
    db.flush()

    # An old race's results - must NOT appear in the podium
    db.add_all(
        [
            Result(result_id=1, race_id=1, driver_id=1, constructor_id=1, grid=1, position=1,
                   position_text="1", position_order=1, points=25, laps=57, status_id=1),
        ]
    )

    # The MOST RECENT race's results - top 4 finishers, only top 3 should appear in podium
    db.add_all(
        [
            Result(result_id=2, race_id=4, driver_id=2, constructor_id=2, grid=1, position=1,
                   position_text="1", position_order=1, points=25, laps=50, status_id=1),
            Result(result_id=3, race_id=4, driver_id=3, constructor_id=3, grid=2, position=2,
                   position_text="2", position_order=2, points=18, laps=50, status_id=1),
            Result(result_id=4, race_id=4, driver_id=1, constructor_id=1, grid=3, position=3,
                   position_text="3", position_order=3, points=15, laps=50, status_id=1),
            Result(result_id=5, race_id=4, driver_id=4, constructor_id=1, grid=4, position=4,
                   position_text="4", position_order=4, points=12, laps=50, status_id=1),
        ]
    )
    db.commit()


class TestDashboardWithData:
    def test_totals_are_correct(self, db_session, client_with_db):
        seed_dashboard_dataset(db_session)

        response = client_with_db.get("/api/v1/dashboard")

        assert response.status_code == 200
        body = response.json()
        assert body["totalRaces"] == 4
        assert body["totalDrivers"] == 4
        assert body["totalConstructors"] == 3
        assert body["totalSeasons"] == 3

    def test_wins_by_season_chart_counts_races_per_season(self, db_session, client_with_db):
        seed_dashboard_dataset(db_session)

        response = client_with_db.get("/api/v1/dashboard")
        chart = {p["season"]: p["wins"] for p in response.json()["winsBySeasonChart"]}

        assert chart[2021] == 2
        assert chart[2022] == 1
        assert chart[2023] == 1

    def test_podium_comes_from_the_most_recent_race_only(self, db_session, client_with_db):
        seed_dashboard_dataset(db_session)

        response = client_with_db.get("/api/v1/dashboard")
        podium = response.json()["latestRacePodium"]

        # Exactly 3, even though the latest race had 4 classified finishers
        assert len(podium) == 3
        assert podium[0] == {
            "position": 1, "driverName": "Charles Leclerc",
            "constructorName": "Ferrari", "constructorRef": "ferrari", "points": 25.0,
        }
        assert podium[1]["driverName"] == "Lewis Hamilton"
        assert podium[2]["driverName"] == "Max Verstappen"
        # Perez (4th place in the latest race) must NOT appear
        assert not any(p["driverName"] == "Sergio Perez" for p in podium)
        # Verstappen's OLD win (race 1, 2021) must not be confused with the podium
        assert podium[2]["points"] == 15.0  # his P3 finish in the latest race, not his old win's 25


class TestDashboardEmptyDatabase:
    def test_returns_200_with_zeros_and_empty_lists_rather_than_404(self, db_session, client_with_db):
        response = client_with_db.get("/api/v1/dashboard")

        assert response.status_code == 200
        body = response.json()
        assert body["totalRaces"] == 0
        assert body["totalDrivers"] == 0
        assert body["totalConstructors"] == 0
        assert body["totalSeasons"] == 0
        assert body["winsBySeasonChart"] == []
        assert body["latestRacePodium"] == []
