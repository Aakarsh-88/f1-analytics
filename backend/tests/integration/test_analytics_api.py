"""Integration tests for the Analytics API."""

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.constructor_result import ConstructorResult
from app.models.driver import Driver
from app.models.qualifying import Qualifying
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_analytics_dataset(db: Session) -> None:
    db.add_all(
        [
            Season(year=2022),
            Season(year=2023),
            Status(status_id=1, status="Finished"),
            Circuit(circuit_id=1, circuit_ref="test", name="Test Circuit", country="UK"),
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
            Race(race_id=1, year=2022, round=1, circuit_id=1, name="2022 Race"),
            Race(race_id=2, year=2023, round=1, circuit_id=1, name="2023 Race"),
        ]
    )
    db.add_all(
        [
            Result(
                result_id=1,
                race_id=1,
                driver_id=1,
                constructor_id=1,
                grid=1,
                position=1,
                position_text="1",
                position_order=1,
                points=25,
                laps=50,
                rank=1,
                status_id=1,
            ),
            Result(
                result_id=2,
                race_id=1,
                driver_id=2,
                constructor_id=2,
                grid=2,
                position=2,
                position_text="2",
                position_order=2,
                points=18,
                laps=50,
                rank=2,
                status_id=1,
            ),
            Result(
                result_id=3,
                race_id=2,
                driver_id=1,
                constructor_id=1,
                grid=1,
                position=2,
                position_text="2",
                position_order=2,
                points=18,
                laps=50,
                rank=1,
                status_id=1,
            ),
        ]
    )
    db.add_all(
        [
            Qualifying(
                qualify_id=1,
                race_id=1,
                driver_id=1,
                constructor_id=1,
                position=1,
            ),
            Qualifying(
                qualify_id=2,
                race_id=1,
                driver_id=2,
                constructor_id=2,
                position=3,
            ),
            Qualifying(
                qualify_id=3,
                race_id=2,
                driver_id=1,
                constructor_id=1,
                position=2,
            ),
        ]
    )
    db.add_all(
        [
            ConstructorResult(
                constructor_results_id=1,
                race_id=1,
                constructor_id=1,
                points=25,
            ),
            ConstructorResult(
                constructor_results_id=2,
                race_id=1,
                constructor_id=2,
                points=18,
            ),
            ConstructorResult(
                constructor_results_id=3,
                race_id=2,
                constructor_id=1,
                points=18,
            ),
        ]
    )
    db.commit()


class TestAnalyticsApi:
    def test_returns_expected_top_level_sections(self, db_session, client_with_db):
        seed_analytics_dataset(db_session)

        response = client_with_db.get("/api/v1/analytics")

        assert response.status_code == 200
        assert set(response.json()) == {
            "seasonRange",
            "constructorDominance",
            "poleLeaderboard",
            "fastestLapLeaderboard",
            "avgQualifying",
            "podiumTrends",
        }

    def test_season_range_and_constructor_dominance_contract(self, db_session, client_with_db):
        seed_analytics_dataset(db_session)

        body = client_with_db.get("/api/v1/analytics").json()
        season_range = body["seasonRange"]
        dominance = body["constructorDominance"]

        assert set(season_range) == {"min", "max"}
        assert isinstance(season_range["min"], int)
        assert isinstance(season_range["max"], int)
        assert season_range["min"] <= season_range["max"]
        assert season_range == {"min": 2022, "max": 2023}
        assert isinstance(dominance["constructors"], list)
        assert isinstance(dominance["points"], list)
        assert all(set(item) == {"ref", "name"} for item in dominance["constructors"])
        assert all("season" in point for point in dominance["points"])
        assert all(
            isinstance(value, (int, float))
            for point in dominance["points"]
            for key, value in point.items()
            if key != "season"
        )

    def test_leaderboards_have_non_negative_integer_counts(self, db_session, client_with_db):
        seed_analytics_dataset(db_session)

        body = client_with_db.get("/api/v1/analytics").json()
        for row in body["poleLeaderboard"]:
            assert {"driverCode", "driverName", "poles"} <= set(row)
            assert isinstance(row["poles"], int)
            assert row["poles"] >= 0
        for row in body["fastestLapLeaderboard"]:
            assert {"driverCode", "driverName", "fastestLaps"} <= set(row)
            assert isinstance(row["fastestLaps"], int)
            assert row["fastestLaps"] >= 0

    def test_season_based_driver_analytics_and_camel_case(self, db_session, client_with_db):
        seed_analytics_dataset(db_session)

        body = client_with_db.get("/api/v1/analytics").json()
        avg_qualifying = body["avgQualifying"]
        podium_trends = body["podiumTrends"]

        assert {"driverCodes", "points"} <= set(avg_qualifying)
        assert {"driverCodes", "points"} <= set(podium_trends)
        assert "avg_qualifying" not in body
        assert "podium_trends" not in body
        assert avg_qualifying["driverCodes"]
        assert podium_trends["driverCodes"]
        assert all(
            isinstance(value, (int, float))
            for point in avg_qualifying["points"]
            for key, value in point.items()
            if key != "season"
        )
        assert all(
            isinstance(value, int) and value >= 0
            for point in podium_trends["points"]
            for key, value in point.items()
            if key != "season"
        )
        assert "driverCode" in body["poleLeaderboard"][0]
        assert "fastestLaps" in body["fastestLapLeaderboard"][0]
