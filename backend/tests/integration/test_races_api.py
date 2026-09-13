"""Integration tests for the Races API."""

from datetime import date

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.driver import Driver
from app.models.lap_time import LapTime
from app.models.pit_stop import PitStop
from app.models.qualifying import Qualifying
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_races_dataset(db: Session) -> None:
    db.add_all(
        [
            Season(year=2022),
            Season(year=2023),
            Status(status_id=1, status="Finished"),
            Status(status_id=2, status="Accident"),
            Circuit(
                circuit_id=1,
                circuit_ref="silverstone",
                name="Silverstone Circuit",
                country="UK",
            ),
            Constructor(constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing"),
            Constructor(constructor_id=2, constructor_ref="ferrari", name="Ferrari"),
            Driver(
                driver_id=1,
                driver_ref="verstappen",
                code="VER",
                forename="Max",
                surname="Verstappen",
            ),
            Driver(
                driver_id=2,
                driver_ref="leclerc",
                code="LEC",
                forename="Charles",
                surname="Leclerc",
            ),
        ]
    )
    db.add_all(
        [
            Race(
                race_id=1,
                year=2022,
                round=1,
                circuit_id=1,
                name="Old Grand Prix",
                date=date(2022, 3, 20),
            ),
            Race(
                race_id=2,
                year=2023,
                round=1,
                circuit_id=1,
                name="Latest Grand Prix",
                date=date(2023, 3, 26),
            ),
            Race(
                race_id=3,
                year=2023,
                round=2,
                circuit_id=1,
                name="Newest Round",
                date=date(2023, 4, 2),
            ),
        ]
    )
    db.add_all(
        [
            Result(
                result_id=1,
                race_id=2,
                driver_id=1,
                constructor_id=1,
                grid=1,
                position=1,
                position_text="1",
                position_order=1,
                points=25,
                laps=57,
                fastest_lap_time="1:30.000",
                status_id=1,
            ),
            Result(
                result_id=2,
                race_id=2,
                driver_id=2,
                constructor_id=2,
                grid=2,
                position=None,
                position_text="R",
                position_order=20,
                points=0,
                laps=30,
                status_id=2,
            ),
        ]
    )
    db.add_all(
        [
            Qualifying(
                qualify_id=1,
                race_id=2,
                driver_id=1,
                constructor_id=1,
                position=1,
                q1="1:20.000",
                q2="1:19.500",
                q3="1:19.000",
            ),
            Qualifying(
                qualify_id=2,
                race_id=2,
                driver_id=2,
                constructor_id=2,
                position=2,
                q1="1:21.000",
                q2=None,
                q3=None,
            ),
        ]
    )
    db.add(
        PitStop(
            race_id=2,
            driver_id=1,
            stop=1,
            lap=15,
            time="13:25:00",
            duration="22.500",
        )
    )
    db.add(
        LapTime(
            race_id=2,
            driver_id=1,
            lap=1,
            position=1,
            time="1:35.123",
            milliseconds=95123,
        )
    )
    db.commit()


class TestRacesApi:
    def test_season_filter_returns_ascending_rounds_and_winner_metadata(
        self, db_session, client_with_db
    ):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races", params={"season": 2023})

        assert response.status_code == 200
        body = response.json()
        assert [race["round"] for race in body] == [1, 2]
        assert body[0]["winnerDriverName"] == "Max Verstappen"
        assert body[0]["winnerConstructorAbbreviation"] == "RBR"
        assert body[1].get("winnerDriverName") is None

    def test_season_without_results_marks_race_winner_as_na_data(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races", params={"season": 2022})

        assert response.status_code == 200
        assert response.json()[0].get("winnerDriverName") is None

    def test_list_returns_summaries_in_newest_year_round_order(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races")

        assert response.status_code == 200
        body = response.json()
        assert [race["raceId"] for race in body] == [3, 2, 1]
        assert body[0] == {
            "raceId": 3,
            "year": 2023,
            "round": 2,
            "name": "Newest Round",
            "circuitName": "Silverstone Circuit",
            "country": "UK",
            "date": "2023-04-02",
        }

    def test_detail_returns_summary_and_all_related_data(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races/2")

        assert response.status_code == 200
        body = response.json()
        assert body["race"]["raceId"] == 2
        assert body["race"]["name"] == "Latest Grand Prix"
        assert body["results"][0]["driverName"] == "Max Verstappen"
        assert body["results"][0]["constructorRef"] == "red_bull"
        assert body["qualifying"][0]["driverName"] == "Max Verstappen"
        assert body["qualifying"][1]["q2"] is None
        assert body["pitStops"] == [
            {
                "driverName": "Max Verstappen",
                "stop": 1,
                "lap": 15,
                "time": "13:25:00",
                "duration": "22.500",
            }
        ]
        assert body["lapTimes"] == [{"lap": 1, "driverCode": "VER", "seconds": 95.123}]

    def test_missing_race_returns_not_found(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races/999")

        assert response.status_code == 404
        assert response.json()["error_code"] == "not_found"

    def test_empty_related_data_returns_empty_arrays(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races/3")

        assert response.status_code == 200
        body = response.json()
        assert body["qualifying"] == []
        assert body["pitStops"] == []
        assert body["lapTimes"] == []

    def test_results_preserve_position_order_for_dnfs(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        response = client_with_db.get("/api/v1/races/2")

        results = response.json()["results"]
        assert [result["positionText"] for result in results] == ["1", "R"]
        assert results[1]["position"] is None

    def test_lap_time_is_rounded_to_milliseconds(self, db_session, client_with_db):
        seed_races_dataset(db_session)

        lap_times = client_with_db.get("/api/v1/races/2").json()["lapTimes"]

        assert lap_times[0]["seconds"] == 95.123
        assert str(lap_times[0]["seconds"]) == "95.123"
