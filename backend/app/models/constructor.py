"""Constructor (team) model — corresponds to constructors.csv."""

from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.constructor_result import ConstructorResult
    from app.models.constructor_standing import ConstructorStanding
    from app.models.qualifying import Qualifying
    from app.models.result import Result


class Constructor(Base):
    __tablename__ = "constructors"
    __table_args__ = (
        Index("ix_constructors_nationality", "nationality"),
    )

    constructor_id: Mapped[int] = mapped_column(primary_key=True)
    constructor_ref: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    nationality: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    results: Mapped[List["Result"]] = relationship(back_populates="constructor")
    qualifying_sessions: Mapped[List["Qualifying"]] = relationship(back_populates="constructor")
    standings: Mapped[List["ConstructorStanding"]] = relationship(back_populates="constructor")
    constructor_results: Mapped[List["ConstructorResult"]] = relationship(
        back_populates="constructor"
    )

    def __repr__(self) -> str:
        return f"<Constructor id={self.constructor_id} name={self.name!r}>"
