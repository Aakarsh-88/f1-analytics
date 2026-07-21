"""
Season model — corresponds to seasons.csv.

Uses `year` itself as the primary key (not a surrogate ID) because that's
exactly how the source dataset and the domain both treat it — there is
never more than one "season" per calendar year in F1, so an extra
auto-increment ID would add nothing but noise.
"""

from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.race import Race


class Season(Base):
    __tablename__ = "seasons"

    year: Mapped[int] = mapped_column(primary_key=True)
    url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    races: Mapped[List["Race"]] = relationship(back_populates="season")

    def __repr__(self) -> str:
        return f"<Season year={self.year}>"
