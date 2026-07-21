"""
Driver model — corresponds to drivers.csv.

`code` (3-letter driver code, e.g. "HAM", "VER") and `number` (permanent
car number) are both nullable because older/historical drivers in the
dataset predate these conventions (permanent numbers were only
introduced in 2014; 3-letter codes are not recorded for many pre-2000
drivers).
"""

from datetime import date
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor_standing import ConstructorStanding  # noqa: F401
    from app.models.driver_standing import DriverStanding
    from app.models.lap_time import LapTime
    from app.models.pit_stop import PitStop
    from app.models.qualifying import Qualifying
    from app.models.result import Result


class Driver(Base):
    __tablename__ = "drivers"
    __table_args__ = (
        Index("ix_drivers_nationality", "nationality"),
        Index("ix_drivers_surname", "surname"),
    )

    driver_id: Mapped[int] = mapped_column(primary_key=True)
    driver_ref: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    number: Mapped[Optional[int]] = mapped_column(nullable=True)
    code: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    forename: Mapped[str] = mapped_column(String(100), nullable=False)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    results: Mapped[List["Result"]] = relationship(back_populates="driver")
    lap_times: Mapped[List["LapTime"]] = relationship(back_populates="driver")
    pit_stops: Mapped[List["PitStop"]] = relationship(back_populates="driver")
    qualifying_sessions: Mapped[List["Qualifying"]] = relationship(back_populates="driver")
    standings: Mapped[List["DriverStanding"]] = relationship(back_populates="driver")

    @property
    def full_name(self) -> str:
        return f"{self.forename} {self.surname}"

    def __repr__(self) -> str:
        return f"<Driver id={self.driver_id} name={self.full_name!r}>"
