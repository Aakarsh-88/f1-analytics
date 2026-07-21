"""
ConstructorStanding model — corresponds to constructor_standings.csv.

Same shape and purpose as DriverStanding, but for constructors —
powers the "constructor dominance over a season" chart.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor import Constructor
    from app.models.race import Race


class ConstructorStanding(Base):
    __tablename__ = "constructor_standings"
    __table_args__ = (
        Index("ix_constructor_standings_race_id", "race_id"),
        Index("ix_constructor_standings_constructor_id", "constructor_id"),
        Index(
            "ix_constructor_standings_constructor_race",
            "constructor_id",
            "race_id",
        ),
    )

    constructor_standings_id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), nullable=False)
    constructor_id: Mapped[int] = mapped_column(
        ForeignKey("constructors.constructor_id"), nullable=False
    )
    points: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    position: Mapped[Optional[int]] = mapped_column(nullable=True)
    position_text: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    wins: Mapped[int] = mapped_column(nullable=False, default=0)

    race: Mapped["Race"] = relationship(back_populates="constructor_standings")
    constructor: Mapped["Constructor"] = relationship(back_populates="standings")

    def __repr__(self) -> str:
        return (
            f"<ConstructorStanding race_id={self.race_id} "
            f"constructor_id={self.constructor_id} pts={self.points}>"
        )
