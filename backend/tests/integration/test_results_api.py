"""
Integration tests for the Results API.

Seed: 2 drivers x 2 constructors x 2 seasons x 2 races each = 8 result
rows, with one deliberate DNF (Hamilton, race 2) to exercise the
null-position / status pass-through path.

2022:
  Race 1: Verstappen(RedBull) P1, Hamilton(Mercedes) P2
  Race 2: Verstappen(RedBull) P1, Hamilton(Mercedes) DNF (Accident)
2023:
  Race 3: Verstappen(RedBull) P2, Hamilton(Mercedes) P1
  Race 4: Verstappen(RedBull) P1, Hamilton(Mercedes) P2
"""

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_results_dataset(db: Session) -> None:
    db.add_all([Season(year=2022), Season(year=2023)])
    db.add(Status(status_id=1, status="Finished"))
    db.add(Status(status_id=2, status="Accident"))
    db.add(Circuit(circuit_id=1, circuit_ref="silverstone", name="Silverstone Circuit"))
    db.add(Constructor(constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing"))
    db.add(Constructor(constructor_id=2, constructor_ref="mercedes", name="Mercedes"))
    db.add(Driver(driver_id=1, driver_ref="verstappen", forename="Max", surname="Verstappen"))
    db.add(Driver(driver_id=2, driver_ref="hamilton", forename="Lewis", surname="Hamilton"))
    db.flush()

    db.add_all(
        [
            Race(race_id=1, year=2022, round=1, circuit_id=1, name="Race 1 2022"),
            Race(race_id=2, year=2022, round=2, circuit_id=1, name="Race 2 2022"),
            Race(race_id=3, year=2023, round=1, circuit_id=1, name="Race 1 2023"),
            Race(race_id=4, year=2023, round=2, circuit_id=1, name="Race 2 2023"),
        ]
    )
    db.flush()

    def finished(rid, race_id, driver_id, constructor_id, position):
        return Result(
            result_id=rid, race_id=race_id, driver_id=driver_id, constructor_id=constructor_id,
            grid=position, position=position, position_text=str(position), position_order=position,
            points=25 if position == 1 else 18, laps=57, status_id=1,
        )

    db.add_all(
        [
            finished(1, 1, 1, 1, 1),  # race1: verstappen P1
            finished(2, 1, 2, 2, 2),  # race1: hamilton P2
            finished(3, 2, 1, 1, 1),  # race2: verstappen P1
            Result(  # race2: hamilton DNF
                result_id=4, race_id=2, driver_id=2, constructor_id=2, grid=3, position=None,
                position_text="DNF", position_order=20, points=0, laps=12, status_id=2,
            ),
            finished(5, 3, 1, 1, 2),  # race3: verstappen P2
            finished(6, 3, 2, 2, 1),  # race3: hamilton P1
            finished(7, 4, 1, 1, 1),  # race4: verstappen P1
            finished(8, 4, 2, 2, 2),  # race4: hamilton P2
        ]
    )
    db.commit()


class TestListResults:
    def test_no_filters_returns_everything(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results")

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 8

    def test_default_ordering_is_most_recent_season_first(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"page_size": 2})
        items = response.json()["items"]

        # Most recent race (race 4, 2023 round 2), P1 before P2
        assert items[0]["season"] == 2023
        assert items[0]["round"] == 2
        assert items[0]["driverRef"] == "verstappen"
        assert items[1]["driverRef"] == "hamilton"

    def test_filter_by_driver_ref(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"driverRef": "verstappen"})
        body = response.json()

        assert body["total"] == 4
        assert all(item["driverRef"] == "verstappen" for item in body["items"])

    def test_filter_by_constructor_ref(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"constructorRef": "mercedes"})
        body = response.json()

        assert body["total"] == 4
        assert all(item["constructorRef"] == "mercedes" for item in body["items"])

    def test_filter_by_season(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"season": 2023})
        body = response.json()

        assert body["total"] == 4
        assert all(item["season"] == 2023 for item in body["items"])

    def test_filter_by_race_id(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"raceId": 1})
        body = response.json()

        assert body["total"] == 2
        assert [item["driverRef"] for item in body["items"]] == ["verstappen", "hamilton"]

    def test_combined_filters(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get(
            "/api/v1/results", params={"driverRef": "hamilton", "season": 2022}
        )
        body = response.json()

        assert body["total"] == 2
        assert {item["round"] for item in body["items"]} == {1, 2}

    def test_dnf_row_has_null_position_and_correct_status(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get(
            "/api/v1/results", params={"driverRef": "hamilton", "raceId": 2}
        )
        item = response.json()["items"][0]

        assert item["position"] is None
        assert item["positionText"] == "DNF"
        assert item["status"] == "Accident"
        assert item["points"] == 0.0

    def test_pagination(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"page": 2, "page_size": 3})
        body = response.json()

        assert len(body["items"]) == 3
        assert body["total"] == 8
        assert body["total_pages"] == 3
        assert body["page"] == 2

    def test_no_matches_returns_empty_not_an_error(self, db_session, client_with_db):
        seed_results_dataset(db_session)

        response = client_with_db.get("/api/v1/results", params={"driverRef": "does-not-exist"})

        assert response.status_code == 200
        assert response.json()["total"] == 0
        assert response.json()["items"] == []
