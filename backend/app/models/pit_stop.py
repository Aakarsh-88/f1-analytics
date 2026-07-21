"""
PitStop model — corresponds to pit_stops.csv.

Composite primary key (race_id, driver_id, stop) for the same reason as
LapTime: these three columns are already naturally unique together, and
using them as the PK gives us the right index for "this driver's pit
stops in this race, in order" for free.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.driver import Driver
    from app.models.race import Race


class PitStop(Base):
    __tablename__ = "pit_stops"
    __table_args__ = (
        Index("ix_pit_stops_driver_id", "driver_id"),
    )

    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), primary_key=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.driver_id"), primary_key=True)
    stop: Mapped[int] = mapped_column(primary_key=True)
    lap: Mapped[int] = mapped_column(nullable=False)
    time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    milliseconds: Mapped[Optional[int]] = mapped_column(nullable=True)

    race: Mapped["Race"] = relationship(back_populates="pit_stops")
    driver: Mapped["Driver"] = relationship(back_populates="pit_stops")

    def __repr__(self) -> str:
        return f"<PitStop race_id={self.race_id} driver_id={self.driver_id} stop={self.stop}>"
