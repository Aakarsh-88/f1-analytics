"""
Integration tests for the Drivers API.

These seed a small, hand-crafted dataset into a real (in-memory SQLite)
database and hit the actual `/api/v1/drivers` endpoints through
FastAPI's TestClient — exercising the real router, service, and
aggregation SQL end-to-end, not a mocked stand-in. The seed data is
deliberately small and its expected stats are computed by hand in each
test's comments, so a wrong query produces an obviously wrong number
rather than a subtly-wrong one hidden by realistic-looking data.
"""

from datetime import date

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.driver_standing import DriverStanding
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_basic_dataset(db: Session) -> None:
    """
    Two drivers, one season, two races:

    Race 1 (round 1): Verstappen P1 (win), Hamilton P2 (podium, no points-only finish)
    Race 2 (round 2, the LAST race of 2023): Verstappen P1 (win), Hamilton DNF (Accident)

    Verstappen: 2 wins, 2 podiums, 0 DNFs, avg finish 1.0, win% 100.0,
                champion of 2023 (P1 in final standings at race 2).
    Hamilton:   0 wins, 1 podium, 1 DNF, avg finish 2.0 (only race 1 counts),
                win% 0.0, not champion (P2 in final standings).
    """
    db.add(Season(year=2023))
    db.add(Status(status_id=1, status="Finished"))
    db.add(Status(status_id=2, status="Accident"))
    db.add(
        Constructor(
            constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing", nationality="Austrian"
        )
    )
    db.add(
        Driver(
            driver_id=1,
            driver_ref="verstappen",
            forename="Max",
            surname="Verstappen",
            code="VER",
            number=1,
            nationality="Dutch",
            dob=date(1997, 9, 30),
        )
    )
    db.add(
        Driver(
            driver_id=2,
            driver_ref="hamilton",
            forename="Lewis",
            surname="Hamilton",
            code="HAM",
            number=44,
            nationality="British",
            dob=date(1985, 1, 7),
        )
    )
    db.flush()

    circuit = Circuit(circuit_id=1, circuit_ref="silverstone", name="Silverstone Circuit")
    db.add(circuit)
    db.flush()

    db.add(Race(race_id=1, year=2023, round=1, circuit_id=circuit.circuit_id, name="Race 1"))
    db.add(Race(race_id=2, year=2023, round=2, circuit_id=circuit.circuit_id, name="Race 2"))
    db.flush()

    db.add_all(
        [
            Result(
                result_id=1, race_id=1, driver_id=1, constructor_id=1, grid=1, position=1,
                position_text="1", position_order=1, points=25, laps=57, status_id=1,
            ),
            Result(
                result_id=2, race_id=1, driver_id=2, constructor_id=1, grid=2, position=2,
                position_text="2", position_order=2, points=18, laps=57, status_id=1,
            ),
            Result(
                result_id=3, race_id=2, driver_id=1, constructor_id=1, grid=1, position=1,
                position_text="1", position_order=1, points=25, laps=57, status_id=1,
            ),
            Result(
                result_id=4, race_id=2, driver_id=2, constructor_id=1, grid=3, position=None,
                position_text="DNF", position_order=20, points=0, laps=30, status_id=2,
            ),
        ]
    )

    # Final-standings snapshot for the LAST race of the season only —
    # this is what the championships query actually reads.
    db.add_all(
        [
            DriverStanding(driver_standings_id=1, race_id=2, driver_id=1, points=50, position=1, wins=2),
            DriverStanding(driver_standings_id=2, race_id=2, driver_id=2, points=18, position=2, wins=0),
        ]
    )
    db.commit()


class TestListDrivers:
    def test_returns_all_seeded_drivers_with_correct_stats(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers")

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 2

        by_ref = {item["driverRef"]: item for item in body["items"]}

        verstappen = by_ref["verstappen"]
        assert verstappen["wins"] == 2
        assert verstappen["podiums"] == 2
        assert verstappen["championships"] == 1
        assert verstappen["winPercentage"] == 100.0

        hamilton = by_ref["hamilton"]
        assert hamilton["wins"] == 0
        assert hamilton["podiums"] == 1
        assert hamilton["championships"] == 0
        assert hamilton["winPercentage"] == 0.0

    def test_search_filters_by_surname(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers", params={"search": "hamilton"})

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert body["items"][0]["driverRef"] == "hamilton"

    def test_search_is_case_insensitive_and_matches_nationality(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers", params={"search": "DUTCH"})

        assert response.json()["total"] == 1
        assert response.json()["items"][0]["driverRef"] == "verstappen"

    def test_pagination_respects_page_size(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers", params={"page": 1, "page_size": 1})

        body = response.json()
        assert len(body["items"]) == 1
        assert body["total"] == 2
        assert body["total_pages"] == 2


class TestGetDriverDetail:
    def test_returns_full_detail_for_verstappen(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers/verstappen")

        assert response.status_code == 200
        body = response.json()

        assert body["summary"]["fullName"] == "Max Verstappen"
        assert body["totalRaces"] == 2
        assert body["averageFinish"] == 1.0
        assert body["dnfPercentage"] == 0.0
        assert body["winsBySeasonChart"] == [{"season": 2023, "wins": 2}]
        assert body["resultsBreakdown"] == {
            "wins": 2,
            "otherPodiums": 0,
            "pointsFinishes": 0,
            "noPointsFinishes": 0,
            "dnfs": 0,
        }

    def test_hamilton_dnf_and_average_finish_exclude_the_dnf_race(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers/hamilton")
        body = response.json()

        assert body["totalRaces"] == 2
        # Only race 1 (P2) counts toward the average — race 2 was a DNF
        # with no finishing position, so it must not drag the average down.
        assert body["averageFinish"] == 2.0
        assert body["dnfPercentage"] == 50.0
        assert body["resultsBreakdown"]["dnfs"] == 1

    def test_returns_404_for_unknown_driver_ref(self, db_session, client_with_db):
        seed_basic_dataset(db_session)

        response = client_with_db.get("/api/v1/drivers/does-not-exist")

        assert response.status_code == 404
        assert response.json()["error_code"] == "not_found"
