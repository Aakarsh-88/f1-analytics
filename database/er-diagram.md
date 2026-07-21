# Entity-Relationship Diagram

Rendered automatically by GitHub/GitLab (Mermaid support) or any Mermaid
live editor. Cardinality: `||--o{` reads as "one (mandatory) to many (optional)".

```mermaid
erDiagram
    SEASONS ||--o{ RACES : "has"
    CIRCUITS ||--o{ RACES : "hosts"
    RACES ||--o{ RESULTS : "produces"
    RACES ||--o{ LAP_TIMES : "produces"
    RACES ||--o{ PIT_STOPS : "produces"
    RACES ||--o{ QUALIFYING : "produces"
    RACES ||--o{ DRIVER_STANDINGS : "produces"
    RACES ||--o{ CONSTRUCTOR_STANDINGS : "produces"
    RACES ||--o{ CONSTRUCTOR_RESULTS : "produces"

    DRIVERS ||--o{ RESULTS : "achieves"
    DRIVERS ||--o{ LAP_TIMES : "sets"
    DRIVERS ||--o{ PIT_STOPS : "makes"
    DRIVERS ||--o{ QUALIFYING : "sets"
    DRIVERS ||--o{ DRIVER_STANDINGS : "holds"

    CONSTRUCTORS ||--o{ RESULTS : "fields"
    CONSTRUCTORS ||--o{ QUALIFYING : "fields"
    CONSTRUCTORS ||--o{ CONSTRUCTOR_STANDINGS : "holds"
    CONSTRUCTORS ||--o{ CONSTRUCTOR_RESULTS : "scores"

    STATUS ||--o{ RESULTS : "classifies"

    SEASONS {
        int year PK
        string url
    }
    CIRCUITS {
        int circuit_id PK
        string circuit_ref UK
        string name
        string location
        string country
        numeric lat
        numeric lng
        int alt
    }
    DRIVERS {
        int driver_id PK
        string driver_ref UK
        int number
        string code
        string forename
        string surname
        date dob
        string nationality
    }
    CONSTRUCTORS {
        int constructor_id PK
        string constructor_ref UK
        string name
        string nationality
    }
    STATUS {
        int status_id PK
        string status UK
    }
    RACES {
        int race_id PK
        int year FK
        int round
        int circuit_id FK
        string name
        date date
        time time
    }
    RESULTS {
        int result_id PK
        int race_id FK
        int driver_id FK
        int constructor_id FK
        int grid
        int position
        int position_order
        numeric points
        int laps
        int status_id FK
    }
    LAP_TIMES {
        int race_id PK_FK
        int driver_id PK_FK
        int lap PK
        int position
        string time
        int milliseconds
    }
    PIT_STOPS {
        int race_id PK_FK
        int driver_id PK_FK
        int stop PK
        int lap
        string duration
        int milliseconds
    }
    QUALIFYING {
        int qualify_id PK
        int race_id FK
        int driver_id FK
        int constructor_id FK
        int position
        string q1
        string q2
        string q3
    }
    DRIVER_STANDINGS {
        int driver_standings_id PK
        int race_id FK
        int driver_id FK
        numeric points
        int position
        int wins
    }
    CONSTRUCTOR_STANDINGS {
        int constructor_standings_id PK
        int race_id FK
        int constructor_id FK
        numeric points
        int position
        int wins
    }
    CONSTRUCTOR_RESULTS {
        int constructor_results_id PK
        int race_id FK
        int constructor_id FK
        numeric points
        string status
    }
```

## Relationship summary

| Relationship | Cardinality | Notes |
|---|---|---|
| Season → Race | 1:N | A season has many races; a race belongs to exactly one season (via `year`). |
| Circuit → Race | 1:N | A circuit hosts many races over the years; a race is held at exactly one circuit. |
| Race → Result / LapTime / PitStop / Qualifying / DriverStanding / ConstructorStanding / ConstructorResult | 1:N | Every per-race detail table hangs off `race_id`. |
| Driver → Result / LapTime / PitStop / Qualifying / DriverStanding | 1:N | A driver appears in many races over a career. |
| Constructor → Result / Qualifying / ConstructorStanding / ConstructorResult | 1:N | A constructor fields cars across many races. |
| Status → Result | 1:N | A finish status (e.g. "Finished", "Engine", "Accident") applies to many results. |

## Design notes

- **`LapTime` and `PitStop` use composite primary keys** (`race_id, driver_id, lap` / `race_id, driver_id, stop`) rather than surrogate IDs — see `database/INDEX_STRATEGY.md` for the reasoning.
- **`DriverStanding`/`ConstructorStanding` store cumulative season points** as of each race, not just that race's points — this is what the source dataset provides and what the championship-progression chart needs directly, with no running-sum calculation required at query time.
- **`ConstructorResult`** is distinct from `ConstructorStanding`: it holds the points scored in a *single* race, whereas `ConstructorStanding` holds the cumulative total after that race.
