"""
Shared Pydantic base for every response schema.

Every schema in this app inherits from `CamelModel` so the API's JSON
output uses camelCase field names (`driverId`, `winPercentage`) even
though the Python/SQLAlchemy side stays idiomatic snake_case
(`driver_id`, `win_percentage`). This matters concretely: the frontend's
existing TypeScript types (DriverSummary, DriverDetail, etc. — written
back in Milestone 5 against the eventual real API) are already
camelCase, so this is what lets `lib/api/drivers.ts` swap its mock
implementation for a real `fetch()` with zero field-mapping code.
"""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
