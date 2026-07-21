"""
Status model — corresponds to status.csv.

A small lookup table (~140 rows: "Finished", "Accident", "Engine",
"Collision", etc.) referenced by every row in `results`. Kept as a
proper foreign-key relationship rather than a free-text column so DNF
analytics (Milestone 7 charts) can group/filter reliably instead of
string-matching.
"""

from typing import TYPE_CHECKING, List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.result import Result


class Status(Base):
    __tablename__ = "status"

    status_id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    results: Mapped[List["Result"]] = relationship(back_populates="status")

    def __repr__(self) -> str:
        return f"<Status id={self.status_id} status={self.status!r}>"
