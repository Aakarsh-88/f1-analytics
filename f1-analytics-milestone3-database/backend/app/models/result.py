"""
Result model — corresponds to results.csv.

One row per (race, driver) — this is where most driver career stats
(wins, podiums, points, average finishing position) are aggregated from.

`position` is nullable because a DNF has no finishing position (only
`position_order`, which is always populated and safe to sort/rank by
even for non-finishers — that's exactly why the source dataset provides
both columns).
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor import Constructor
    from app.models.driver import Driver
    from app.models.race import Race
    from app.models.status import Status


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        Index("ix_results_race_id", "race_id"),
        Index("ix_results_driver_id", "driver_id"),
        Index("ix_results_constructor_id", "constructor_id"),
        Index("ix_results_status_id", "status_id"),
        # Speeds up "all of this driver's results, race-ordered" — the core
        # query behind every career-stats and win-percentage calculation.
        Index("ix_results_driver_race", "driver_id", "race_id"),
    )

    result_id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.driver_id"), nullable=False)
    constructor_id: Mapped[int] = mapped_column(
        ForeignKey("constructors.constructor_id"), nullable=False
    )
    number: Mapped[Optional[int]] = mapped_column(nullable=True)
    grid: Mapped[int] = mapped_column(nullable=False, default=0)
    position: Mapped[Optional[int]] = mapped_column(nullable=True)
    position_text: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    position_order: Mapped[int] = mapped_column(nullable=False)
    points: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    laps: Mapped[int] = mapped_column(nullable=False, default=0)
    time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    milliseconds: Mapped[Optional[int]] = mapped_column(nullable=True)
    fastest_lap: Mapped[Optional[int]] = mapped_column(nullable=True)
    rank: Mapped[Optional[int]] = mapped_column(nullable=True)
    fastest_lap_time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    fastest_lap_speed: Mapped[Optional[float]] = mapped_column(Numeric(7, 3), nullable=True)
    status_id: Mapped[int] = mapped_column(ForeignKey("status.status_id"), nullable=False)

    race: Mapped["Race"] = relationship(back_populates="results")
    driver: Mapped["Driver"] = relationship(back_populates="results")
    constructor: Mapped["Constructor"] = relationship(back_populates="results")
    status: Mapped["Status"] = relationship(back_populates="results")

    def __repr__(self) -> str:
        return f"<Result race_id={self.race_id} driver_id={self.driver_id} pos={self.position}>"
