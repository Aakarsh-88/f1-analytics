# F1 Analytics

F1 Analytics is a full-stack dashboard for exploring historical Formula 1 races, drivers, constructors, results, standings, and cross-season analytics. The current dataset covers the 1950–2024 seasons.

## Features

- Dashboard statistics, seasonal wins, and latest-race podium
- Driver and constructor career summaries
- Championship standings and points progression
- Race Explorer with results, qualifying, pit stops, and lap times
- Analytics for constructor dominance, pole positions, fastest laps, qualifying pace, podium trends, and driver/team comparisons
- Search across drivers, constructors, races, and standings
- Clerk-powered frontend sign-in for protected frontend routes

## Tech stack

- **Frontend:** Next.js, React, TypeScript, Recharts, Tailwind CSS
- **Backend:** FastAPI, Python, SQLAlchemy, Pydantic
- **Database:** PostgreSQL
- **Migrations:** Alembic
- **Authentication:** Clerk
- **Data processing:** Python, pandas, and the CSV import/validation scripts

## Architecture

```text
CSV dataset
    │
    ▼
Validation/import scripts ──► PostgreSQL ◄── Alembic migrations
                                  │
                                  ▼
Next.js frontend ─────────────► FastAPI
```

The frontend calls the FastAPI API. The backend reads historical data from PostgreSQL, while the scripts in `scripts/` validate and bulk-import the source CSV files.

## Repository structure

```text
backend/
  app/                 FastAPI application, models, repositories, services, and schemas
  alembic/             Database migration environment and revisions
  tests/               Backend unit and integration tests
  .env.example         Backend environment variable template
frontend/
  src/                 Next.js app, components, API clients, and types
  tests/               Frontend tests
  .env.local.example   Frontend environment variable template
scripts/
  data/                F1 CSV dataset
  import_csv.py        PostgreSQL bulk importer
  validate_data.py     Pre-import dataset validation
```

## Prerequisites

- Python 3.11+
- Node.js and npm
- PostgreSQL
- A Clerk application for frontend authentication configuration

## Local setup

### 1. Configure the backend

From the repository root:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements-dev.txt
cp backend/.env.example backend/.env
```

Set the required backend variable names in `backend/.env`:

```text
APP_NAME
APP_ENV
DEBUG
API_V1_PREFIX
HOST
PORT
DATABASE_URL
CORS_ORIGINS
CACHE_ENABLED
REDIS_URL
CACHE_TTL_SECONDS
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY
CLERK_JWKS_URL
LOG_LEVEL
LOG_JSON
DEFAULT_PAGE_SIZE
MAX_PAGE_SIZE
```

For local development, `CORS_ORIGINS` should include the frontend origin, normally `http://localhost:3000`. Never commit the real `.env` file or secret values.

### 2. Create the schema and load the dataset

With the backend virtual environment active and the database configured:

```bash
cd backend
alembic upgrade head
cd ..
python scripts/validate_data.py --data-dir scripts/data --strict
python scripts/import_csv.py --data-dir scripts/data
```

The importer supports `--truncate` for a clean re-import and `--only` for selected tables. Use those options carefully because `--truncate` removes existing imported data.

### 3. Configure the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Set these frontend variable names in `frontend/.env.local`:

```text
API_BASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

`API_BASE_URL` must point to the FastAPI server. Do not commit `.env.local`.

## Running locally

Start the backend from the repository root:

```bash
source backend/.venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend runs at `http://localhost:8000` with the default development configuration.

## API and Swagger

The versioned API is mounted under `/api/v1`. With the backend running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health check: `http://localhost:8000/api/v1/health`

## Testing and builds

Backend tests:

```bash
cd backend
source .venv/bin/activate
python -m pytest
```

Frontend type-check, tests, and production build:

```bash
cd frontend
npx tsc --noEmit
npm test -- --runInBand
npm run build
```

## Production notes

- Set `APP_ENV=production` and `DEBUG=false`.
- Configure a valid PostgreSQL `DATABASE_URL`.
- Configure `CORS_ORIGINS` with the deployed frontend origin; do not rely on localhost defaults.
- Provide the required Redis and Clerk environment variables for the services/features being used.
- Set frontend `API_BASE_URL` to the deployed FastAPI base URL.
- Run `alembic upgrade head` before serving traffic.
- Provision the PostgreSQL dataset with the validation and import scripts before using data-backed pages.
- Keep all real environment files and secret values outside Git.

No Docker or platform-specific deployment manifest is currently included in this repository, so infrastructure provisioning and process management remain deployment-environment responsibilities.
