"""
Qualifying model — corresponds to qualifying.csv.

`q1`/`q2`/`q3` are stored as raw time strings (e.g. "1:24.567") rather
than parsed into milliseconds at the model level, matching the source
data exactly. Parsing/formatting for display or sorting is handled in
`services/` where it can be tested independently of the schema.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor import Constructor
    from app.models.driver import Driver
    from app.models.race import Race


class Qualifying(Base):
    __tablename__ = "qualifying"
    __table_args__ = (
        Index("ix_qualifying_race_id", "race_id"),
        Index("ix_qualifying_driver_id", "driver_id"),
        Index("ix_qualifying_constructor_id", "constructor_id"),
    )

    qualify_id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.driver_id"), nullable=False)
    constructor_id: Mapped[int] = mapped_column(
        ForeignKey("constructors.constructor_id"), nullable=False
    )
    number: Mapped[Optional[int]] = mapped_column(nullable=True)
    position: Mapped[Optional[int]] = mapped_column(nullable=True)
    q1: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    q2: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    q3: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    race: Mapped["Race"] = relationship(back_populates="qualifying_sessions")
    driver: Mapped["Driver"] = relationship(back_populates="qualifying_sessions")
    constructor: Mapped["Constructor"] = relationship(back_populates="qualifying_sessions")

    def __repr__(self) -> str:
        return f"<Qualifying race_id={self.race_id} driver_id={self.driver_id} pos={self.position}>"
