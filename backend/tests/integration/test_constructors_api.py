"""
Integration tests for the Constructors API.

Seed data: 2 constructors across 2 seasons, so championships (won in
BOTH seasons for one constructor, neither for the other) and
recentTrend (different win counts per season) are both meaningfully
exercised, not just trivially true.

2022:
  Race 1: Red Bull P1 (win), Mercedes P2
  Race 2 (last of 2022): Red Bull P1 (win), Mercedes P3
2023:
  Race 3: Red Bull P2, Mercedes P1 (win)
  Race 4 (last of 2023): Red Bull P1 (win), Mercedes P2

Red Bull:  wins=3, podiums=4, first_season=2022, championships=2 (P1 at both season-ending races)
Mercedes:  wins=1, podiums=4, first_season=2022, championships=0 (always P2 at season end)
"""

from datetime import date

from sqlalchemy.orm import Session

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.constructor_standing import ConstructorStanding
from app.models.driver import Driver
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status


def seed_two_season_dataset(db: Session) -> None:
    db.add_all([Season(year=2022), Season(year=2023)])
    db.add(Status(status_id=1, status="Finished"))
    db.add(
        Driver(driver_id=1, driver_ref="verstappen", forename="Max", surname="Verstappen", dob=date(1997, 9, 30))
    )
    db.add(
        Driver(driver_id=2, driver_ref="hamilton", forename="Lewis", surname="Hamilton", dob=date(1985, 1, 7))
    )
    db.add(Constructor(constructor_id=1, constructor_ref="red_bull", name="Red Bull Racing", nationality="Austrian"))
    db.add(Constructor(constructor_id=2, constructor_ref="mercedes", name="Mercedes", nationality="German"))
    db.add(Circuit(circuit_id=1, circuit_ref="silverstone", name="Silverstone Circuit"))
    db.flush()

    db.add_all(
        [
            Race(race_id=1, year=2022, round=1, circuit_id=1, name="R1 2022"),
            Race(race_id=2, year=2022, round=2, circuit_id=1, name="R2 2022"),
            Race(race_id=3, year=2023, round=1, circuit_id=1, name="R1 2023"),
            Race(race_id=4, year=2023, round=2, circuit_id=1, name="R2 2023"),
        ]
    )
    db.flush()

    def result(rid, race_id, driver_id, constructor_id, position):
        return Result(
            result_id=rid, race_id=race_id, driver_id=driver_id, constructor_id=constructor_id,
            grid=position, position=position, position_text=str(position), position_order=position,
            points=0, laps=57, status_id=1,
        )

    db.add_all(
        [
            result(1, 1, 1, 1, 1),  # race1: red_bull P1
            result(2, 1, 2, 2, 2),  # race1: mercedes P2
            result(3, 2, 1, 1, 1),  # race2: red_bull P1
            result(4, 2, 2, 2, 3),  # race2: mercedes P3
            result(5, 3, 1, 1, 2),  # race3: red_bull P2
            result(6, 3, 2, 2, 1),  # race3: mercedes P1
            result(7, 4, 1, 1, 1),  # race4: red_bull P1
            result(8, 4, 2, 2, 2),  # race4: mercedes P2
        ]
    )

    db.add_all(
        [
            ConstructorStanding(constructor_standings_id=1, race_id=2, constructor_id=1, points=50, position=1),
            ConstructorStanding(constructor_standings_id=2, race_id=2, constructor_id=2, points=30, position=2),
            ConstructorStanding(constructor_standings_id=3, race_id=4, constructor_id=1, points=100, position=1),
            ConstructorStanding(constructor_standings_id=4, race_id=4, constructor_id=2, points=60, position=2),
        ]
    )
    db.commit()


class TestListConstructors:
    def test_returns_all_seeded_constructors_with_correct_stats(self, db_session, client_with_db):
        seed_two_season_dataset(db_session)

        response = client_with_db.get("/api/v1/constructors")

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 2

        by_ref = {item["constructorRef"]: item for item in body["items"]}

        red_bull = by_ref["red_bull"]
        assert red_bull["wins"] == 3
        assert red_bull["podiums"] == 4
        assert red_bull["firstSeason"] == 2022
        assert red_bull["championships"] == 2

        mercedes = by_ref["mercedes"]
        assert mercedes["wins"] == 1
        assert mercedes["podiums"] == 4
        assert mercedes["firstSeason"] == 2022
        assert mercedes["championships"] == 0

    def test_recent_trend_reflects_per_season_win_counts(self, db_session, client_with_db):
        seed_two_season_dataset(db_session)

        response = client_with_db.get("/api/v1/constructors")
        by_ref = {item["constructorRef"]: item for item in response.json()["items"]}

        assert by_ref["red_bull"]["recentTrend"] == [
            {"season": 2022, "wins": 2},
            {"season": 2023, "wins": 1},
        ]
        assert by_ref["mercedes"]["recentTrend"] == [
            {"season": 2022, "wins": 0},
            {"season": 2023, "wins": 1},
        ]

    def test_search_filters_by_name(self, db_session, client_with_db):
        seed_two_season_dataset(db_session)

        response = client_with_db.get("/api/v1/constructors", params={"search": "mercedes"})

        assert response.json()["total"] == 1
        assert response.json()["items"][0]["constructorRef"] == "mercedes"

    def test_search_matches_nationality_case_insensitively(self, db_session, client_with_db):
        seed_two_season_dataset(db_session)

        response = client_with_db.get("/api/v1/constructors", params={"search": "austrian"})

        assert response.json()["total"] == 1
        assert response.json()["items"][0]["constructorRef"] == "red_bull"

    def test_pagination(self, db_session, client_with_db):
        seed_two_season_dataset(db_session)

        response = client_with_db.get("/api/v1/constructors", params={"page": 1, "page_size": 1})
        body = response.json()

        assert len(body["items"]) == 1
        assert body["total"] == 2
        assert body["total_pages"] == 2
