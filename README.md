# Energy Community MVP

A proof-of-concept web app that settles an energy community of 6 neighbouring
houses (3 prosumers, 3 consumers) using the **Mid-Price model (Középár-modell)**
and compares it against traditional grid billing.

```
+-------------+      POST /webhook/powermocker       +--------------------+
| PowerMocker |  ----------------------------------> |  FastAPI backend   |
| (Python)    |                                      |  SQLAlchemy + ORM  |
+-------------+                                      +----------+---------+
                                                                |
                                                                v
                                                         +--------------+
                                                         | PostgreSQL   |
                                                         |  (Podman)    |
                                                         +------+-------+
                                                                |
                                                                | /api/*
                                                                v
                                                         +--------------+
                                                         | React + Vite |
                                                         | Tailwind     |
                                                         | TanStack     |
                                                         | i18next EN/HU|
                                                         +--------------+
```

## Components

- `backend/` — FastAPI + SQLAlchemy + Alembic.
- `frontend/` — React + Vite + TypeScript + Tailwind + TanStack Query/Router + react-i18next + Playwright (headed Chrome).
- `powermocker/` — upstream synthetic energy data generator (cloned in-repo). A new `upload_to_backend.py` pushes generated CSV rows to the FastAPI webhook.
- `scripts/start_db.sh` — boots a local Podman Postgres container.

## Prerequisites

- Podman (tested with 5.x)
- Python 3.11+ (Python 3.14 is not supported by pydantic-core 2.27; use 3.11 in the venv)
- Node 20+ / npm 10+

## 1. Start PostgreSQL in Podman

```bash
./scripts/start_db.sh
# → localhost:5433, user=energy, password=energy, db=energy_community
```

## 2. Backend

```bash
cd backend
python3.11 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head           # creates users + energy_records
.venv/bin/uvicorn app.main:app --reload  # starts on http://127.0.0.1:8000
```

On first startup the 6 hardcoded users are seeded automatically.

### API surface

| Method | Path                     | Purpose                                                   |
|--------|--------------------------|-----------------------------------------------------------|
| GET    | `/api/health`            | liveness probe                                            |
| GET    | `/api/users`             | 6 seeded houses                                           |
| GET    | `/api/data-range`        | first/last ingested timestamp + row count                 |
| GET    | `/api/settlement`        | aggregated Mid-Price settlement (params: `start`, `end`)  |
| POST   | `/api/data-drop`         | truncates `energy_records` (Demo reset)                   |
| POST   | `/webhook/powermocker`   | batch ingestion endpoint (15-min records)                 |

## 3. Upload simulated data from PowerMocker

The upstream PowerMocker already ships a generated CSV
(`powermocker/haz_adatok/osszes_haz_adat.csv`). Re-generate it via
`python powermocker/generator.py` if needed, then:

```bash
cd powermocker
../backend/.venv/bin/python upload_to_backend.py --drop-first         # full year
../backend/.venv/bin/python upload_to_backend.py --days 30 --drop-first
```

`generator.py` also posts to the backend automatically
(URL configurable via `POWERMOCKER_WEBHOOK_URL`).

## 4. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, proxies /api and /webhook to the backend
```

UI features

- Language toggle (EN/HU) via react-i18next.
- Date-window filter, Drop Data button (Demo Mode reset).
- A/B Comparison Panel — grid baseline vs community cost vs savings.
- Community dashboard — per-house settlement table.
- Prosumer profit increment — bar chart showing extra revenue vs grid-only.
- Source mix — visual cue for solar vs grid share in the latest hour.

## 5. Playwright tests (headed Chrome)

```bash
cd frontend
npx playwright install chromium    # one-off browser download
npm run test                       # headed Chrome
```

Tests under `frontend/tests/` cover:
- Dashboard renders title, EN/HU selector, date window, Drop Data button.
- EN → HU language switch.
- A/B panel renders mocked savings via an intercepted `/api/settlement` call.

## Mid-Price settlement algorithm

Hourly pseudocode (see `backend/app/settlement.py`):

1. Aggregate 15-min records into hourly per-user imports / exports using `consumption_kwh - generation_kwh`.
2. `supply = Σ exports`, `demand = Σ imports`, `shared = min(supply, demand)`.
3. Pro-rata allocate `shared` to importing members proportional to their deficit, and to exporters proportional to their surplus.
4. Charge community-allocated energy at 22.5 Ft/kWh; residual import from grid at 40 Ft/kWh, residual export to grid at 5 Ft/kWh.
5. Savings per user = `baseline_cost − community_cost`. Baseline cost = `import × 40 − export × 5`.

## Configuration

Environment variables (backend):

| Name                | Default                                                              |
|---------------------|----------------------------------------------------------------------|
| `DATABASE_URL`      | `postgresql+psycopg://energy:energy@localhost:5433/energy_community` |
| `GRID_BUY_PRICE`    | `40.0`                                                               |
| `GRID_SELL_PRICE`   | `5.0`                                                                |
| `COMMUNITY_PRICE`   | `22.5`                                                               |
| `CORS_ORIGINS`      | `http://localhost:5173`                                              |

PowerMocker: `POWERMOCKER_WEBHOOK_URL` overrides the target webhook.
