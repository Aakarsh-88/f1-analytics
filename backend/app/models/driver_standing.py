"""
DriverStanding model — corresponds to driver_standings.csv.

One row per (race, driver) representing the CUMULATIVE championship
standing immediately after that race — this is what powers the
"championship progression over a season" chart, since each race's row
already carries the running points total, not just that race's points.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.driver import Driver
    from app.models.race import Race


class DriverStanding(Base):
    __tablename__ = "driver_standings"
    __table_args__ = (
        Index("ix_driver_standings_race_id", "race_id"),
        Index("ix_driver_standings_driver_id", "driver_id"),
        Index("ix_driver_standings_driver_race", "driver_id", "race_id"),
    )

    driver_standings_id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.driver_id"), nullable=False)
    points: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    position: Mapped[Optional[int]] = mapped_column(nullable=True)
    position_text: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    wins: Mapped[int] = mapped_column(nullable=False, default=0)

    race: Mapped["Race"] = relationship(back_populates="driver_standings")
    driver: Mapped["Driver"] = relationship(back_populates="standings")

    def __repr__(self) -> str:
        return f"<DriverStanding race_id={self.race_id} driver_id={self.driver_id} pts={self.points}>"
