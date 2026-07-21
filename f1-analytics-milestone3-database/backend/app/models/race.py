"""
Race model — corresponds to races.csv.

This is the most heavily-referenced table in the schema: results,
lap_times, pit_stops, qualifying, driver_standings, constructor_standings,
and constructor_results all key off `race_id`. Every index choice here
is aimed at the two most common access patterns: "all races in season X"
and "race detail page by race_id".

Session date/time columns (fp1, fp2, fp3, quali, sprint) are nullable
because they were only added to the source dataset for recent seasons —
a 1962 race obviously has no "sprint_date".
"""

from datetime import date, time
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, ForeignKey, Index, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.circuit import Circuit
    from app.models.constructor_result import ConstructorResult
    from app.models.constructor_standing import ConstructorStanding
    from app.models.driver_standing import DriverStanding
    from app.models.lap_time import LapTime
    from app.models.pit_stop import PitStop
    from app.models.qualifying import Qualifying
    from app.models.result import Result
    from app.models.season import Season


class Race(Base):
    __tablename__ = "races"
    __table_args__ = (
        Index("ix_races_year", "year"),
        Index("ix_races_circuit_id", "circuit_id"),
        Index("ix_races_year_round", "year", "round", unique=True),
    )

    race_id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[int] = mapped_column(ForeignKey("seasons.year"), nullable=False)
    round: Mapped[int] = mapped_column(nullable=False)
    circuit_id: Mapped[int] = mapped_column(ForeignKey("circuits.circuit_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    fp1_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fp1_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    fp2_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fp2_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    fp3_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fp3_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    quali_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    quali_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    sprint_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sprint_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)

    season: Mapped["Season"] = relationship(back_populates="races")
    circuit: Mapped["Circuit"] = relationship(back_populates="races")
    results: Mapped[List["Result"]] = relationship(back_populates="race")
    lap_times: Mapped[List["LapTime"]] = relationship(back_populates="race")
    pit_stops: Mapped[List["PitStop"]] = relationship(back_populates="race")
    qualifying_sessions: Mapped[List["Qualifying"]] = relationship(back_populates="race")
    driver_standings: Mapped[List["DriverStanding"]] = relationship(back_populates="race")
    constructor_standings: Mapped[List["ConstructorStanding"]] = relationship(
        back_populates="race"
    )
    constructor_results: Mapped[List["ConstructorResult"]] = relationship(back_populates="race")

    def __repr__(self) -> str:
        return f"<Race id={self.race_id} name={self.name!r} year={self.year}>"
