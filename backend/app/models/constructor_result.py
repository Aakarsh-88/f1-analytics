"""
ConstructorResult model — corresponds to constructor_results.csv.

Points scored by a constructor in a SINGLE race (as opposed to
ConstructorStanding, which is the cumulative season total). `status` here
is a free-text field in the source dataset (distinct from the `status`
lookup table used by `results` — it's occasionally used for
disqualification notes) and is kept as-is rather than forced into the
Status foreign key to avoid misrepresenting the source data.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor import Constructor
    from app.models.race import Race


class ConstructorResult(Base):
    __tablename__ = "constructor_results"
    __table_args__ = (
        Index("ix_constructor_results_race_id", "race_id"),
        Index("ix_constructor_results_constructor_id", "constructor_id"),
    )

    constructor_results_id: Mapped[int] = mapped_column(primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.race_id"), nullable=False)
    constructor_id: Mapped[int] = mapped_column(
        ForeignKey("constructors.constructor_id"), nullable=False
    )
    points: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    race: Mapped["Race"] = relationship(back_populates="constructor_results")
    constructor: Mapped["Constructor"] = relationship(back_populates="constructor_results")

    def __repr__(self) -> str:
        return (
            f"<ConstructorResult race_id={self.race_id} "
            f"constructor_id={self.constructor_id} pts={self.points}>"
        )
