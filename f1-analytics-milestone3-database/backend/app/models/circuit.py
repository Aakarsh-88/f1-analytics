"""
Circuit model — corresponds to circuits.csv.

`lat`/`lng`/`alt` are stored as Numeric rather than Float to avoid
floating-point rounding surprises when these coordinates are used for
map rendering on the Race Explorer page.
"""

from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.race import Race


class Circuit(Base):
    __tablename__ = "circuits"
    __table_args__ = (
        Index("ix_circuits_country", "country"),
    )

    circuit_id: Mapped[int] = mapped_column(primary_key=True)
    circuit_ref: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)
    alt: Mapped[Optional[int]] = mapped_column(nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    races: Mapped[List["Race"]] = relationship(back_populates="circuit")

    def __repr__(self) -> str:
        return f"<Circuit id={self.circuit_id} name={self.name!r}>"
