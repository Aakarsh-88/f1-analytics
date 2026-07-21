"""
LapTime model — corresponds to lap_times.csv.

This is by far the largest table in the dataset (millions of rows —
one per driver per lap per race). It uses a composite primary key
(race_id, driver_id, lap) instead of a surrogate ID for two reasons:
1. The source data has no natural single-column unique identifier, and
   these three columns are already guaranteed unique together.
2. A composite PK here doubles as the exact index needed for the most
   common query: "give me this driver's lap-by-lap times for this race"
   (Race Explorer's lap-by-lap visualization) — no extra index required.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.driver import Driver
    from app.models.race import Race


class LapTime(Base):
    __tablename__ = "lap_times"
    __table_args__ = (
        # Supports "all lap times for this driver across every race" queries
        # (e.g. career pace comparisons) without a full table scan.
        Index("ix_lap_times_driver_id", "driver_id"),
    )

    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), primary_key=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.driver_id"), primary_key=True)
    lap: Mapped[int] = mapped_column(primary_key=True)
    position: Mapped[Optional[int]] = mapped_column(nullable=True)
    time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    milliseconds: Mapped[Optional[int]] = mapped_column(nullable=True)

    race: Mapped["Race"] = relationship(back_populates="lap_times")
    driver: Mapped["Driver"] = relationship(back_populates="lap_times")

    def __repr__(self) -> str:
        return f"<LapTime race_id={self.race_id} driver_id={self.driver_id} lap={self.lap}>"
