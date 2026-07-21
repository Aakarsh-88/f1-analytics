# Index Strategy

Every index in this schema exists to serve a specific, known query pattern
from the application — not speculatively. This document explains the
reasoning so future changes can evaluate whether an index is still earning
its keep (indexes aren't free: they slow down writes and consume disk).

## Primary key indexes (automatic)

Every table's primary key is automatically indexed by PostgreSQL. Two
tables deliberately use **composite primary keys** instead of surrogate
IDs, because doing so gives us the exact index the app needs for free:

| Table | Composite PK | Why |
|---|---|---|
| `lap_times` | `(race_id, driver_id, lap)` | The Race Explorer's lap-by-lap chart queries "this driver's laps in this race, in order" — exactly this key, in this order. |
| `pit_stops` | `(race_id, driver_id, stop)` | Same reasoning — "this driver's pit stops in this race, in order." |

## Foreign key indexes

Postgres does **not** automatically index foreign key columns (unlike
some other databases). Every FK column in this schema has an explicit
index because every one of them is used in a `JOIN` or `WHERE` clause by
at least one planned endpoint:

- `races.year`, `races.circuit_id` — season browsing, circuit history pages
- `results.race_id`, `results.driver_id`, `results.constructor_id`, `results.status_id` — race detail page, driver career stats, constructor history, DNF analytics
- `qualifying.race_id/driver_id/constructor_id` — qualifying tab on race detail
- `driver_standings.race_id/driver_id`, `constructor_standings.race_id/constructor_id` — championship progression charts
- `constructor_results.race_id/constructor_id` — constructor season breakdown

## Composite indexes for the highest-traffic queries

| Index | Table | Serves |
|---|---|---|
| `ix_results_driver_race` | `results` | "All of this driver's results, ordered by race" — the query behind wins, podiums, win %, average finish, and DNF rate on the Driver profile page. |
| `ix_driver_standings_driver_race` | `driver_standings` | "This driver's championship position over time" — driver career chart. |
| `ix_constructor_standings_constructor_race` | `constructor_standings` | "This constructor's championship position over time" — constructor dominance chart. |
| `ix_races_year_round` (unique) | `races` | Enforces one race per (year, round) at the database level, and speeds up "races in this season, in calendar order." |

## Lookup/filter indexes

| Index | Table | Serves |
|---|---|---|
| `ix_drivers_nationality`, `ix_constructors_nationality` | `drivers`, `constructors` | Nationality filter on Drivers/Constructors pages. |
| `ix_drivers_surname` | `drivers` | Driver search-by-name. |
| `ix_circuits_country` | `circuits` | Circuit filter on Race Explorer. |

## What's deliberately NOT indexed

- `results.points`, `driver_standings.points` — these are read in aggregate
  (SUM/AVG across many rows) rather than filtered on directly; a plain
  index wouldn't help a full aggregation and would slow down every CSV
  import write.
- Free-text columns like `races.name`, `circuits.name` — full-text search
  isn't a stated requirement; if search-by-race-name becomes a feature,
  revisit this with a proper `GIN`/`pg_trgm` index rather than a plain
  B-tree.

## Revisiting this later

If `EXPLAIN ANALYZE` on a real endpoint shows a sequential scan where an
index scan was expected, that's the signal to add an index — not
intuition. This document should be updated whenever an index is added or
removed, with the same "which query does this serve" justification.
