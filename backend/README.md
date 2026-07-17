# Backend — Spotter Trip Planner API

Django REST API that plans HOS-compliant truck routes and generates ELD daily logs.
See the [root README](../README.md) for the overall project.

## Stack

Django 5 + Django REST Framework, PostgreSQL (via `DATABASE_URL`), `drf-spectacular`
for OpenAPI docs, OSRM for routing, Nominatim for geocoding.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, SECRET_KEY, etc.
python manage.py migrate
python manage.py runserver
```

API is served at `http://localhost:8000/api/`. Interactive docs at `/api/docs/`.

## Environment variables

See [.env.example](.env.example): `DEBUG`, `SECRET_KEY`, `DATABASE_URL`,
`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.

## Tests

```bash
pytest
```

## Architecture

```
TripViewSet (views.py)
  └─ serializers.py            — request/response validation & shaping
       └─ services/planner.py  — orchestrates geocoding + routing + HOS scheduling
            ├─ services/geocoding.py — Nominatim client
            ├─ services/routing.py   — OSRM client
            └─ services/hos.py       — pure HOS rules engine (no I/O, no Django)
```

`hos.py` is a pure function (`plan_trip`) with no network or DB dependencies, so the
regulatory scheduling logic (11h drive cap, 14h window, 30-min break, 10h rest, 70h/8-day
cycle, 34h restart, fuel every 1000mi) can be unit-tested in isolation. See
[docs/learnings.md](../docs/learnings.md) for more design notes.

## Deployment

Deployed to Vercel via `vercel.json` and `build_files.sh` (installs deps, runs
migrations, collects static files).
