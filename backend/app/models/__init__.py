"""
Importing every model here (even though nothing in this file uses the
names directly) is REQUIRED, not decorative: SQLAlchemy only knows about
a model once its class body has executed at least once. Alembic's
autogenerate and `Base.metadata.create_all()` both walk `Base.metadata`,
which is only populated for models that have actually been imported
somewhere in the process. This file guarantees that happens exactly
once, in one place, no matter which module is imported first.
"""

from app.models.circuit import Circuit
from app.models.constructor import Constructor
from app.models.constructor_result import ConstructorResult
from app.models.constructor_standing import ConstructorStanding
from app.models.driver import Driver
from app.models.driver_standing import DriverStanding
from app.models.lap_time import LapTime
from app.models.pit_stop import PitStop
from app.models.qualifying import Qualifying
from app.models.race import Race
from app.models.result import Result
from app.models.season import Season
from app.models.status import Status

__all__ = [
    "Circuit",
    "Constructor",
    "ConstructorResult",
    "ConstructorStanding",
    "Driver",
    "DriverStanding",
    "LapTime",
    "PitStop",
    "Qualifying",
    "Race",
    "Result",
    "Season",
    "Status",
]
