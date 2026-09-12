"""Stable constructor colors used by analytics metadata."""

CONSTRUCTOR_COLORS: dict[str, str] = {
    "mercedes": "#27F4D2",
    "red_bull": "#3671C6",
    "ferrari": "#E8002D",
    "mclaren": "#FF8000",
    "aston_martin": "#229971",
    "alpine": "#0093CC",
    "williams": "#64C4FF",
    "rb": "#6692FF",
    "sauber": "#52E252",
    "haas": "#B6BABD",
}

DEFAULT_CONSTRUCTOR_COLOR = "#6B7280"


def get_constructor_color(constructor_ref: str) -> str:
    return CONSTRUCTOR_COLORS.get(constructor_ref, DEFAULT_CONSTRUCTOR_COLOR)
