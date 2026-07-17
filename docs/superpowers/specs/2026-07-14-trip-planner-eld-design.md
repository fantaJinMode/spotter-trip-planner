# Trip Planner + ELD Log Generator — Design Spec

Date: 2026-07-14
Status: Approved pending user review
Source: `requirements/new-full-stack-dev-assessment.docx`, FMCSA HOS guide (395), blank paper log

## 1. Objective

Full-stack app: user enters trip details, app outputs a driving route on a map plus FMCSA-compliant daily log sheets drawn as graphics. Assessment deliverables: live hosted version, GitHub repo, 3–5 min Loom.

**Inputs:** current location, pickup location, dropoff location, current cycle used (hrs).
**Outputs:** route map with stops/rests; one filled daily log sheet per trip day.

**Assumptions (from requirements):** property-carrying driver, 70 hr / 8 day cycle, no adverse conditions, fuel stop at least every 1,000 miles, 1 hr each for pickup and drop-off.

## 2. Decisions (locked)

| Decision | Choice | Why |
|---|---|---|
| Persistence | PostgreSQL, `Trip` model | Shareable trip URLs, shows DRF craft, cheap to add |
| Map/routing | OSRM (route) + Nominatim (geocode) + Leaflet/OSM tiles | Fully free, zero API keys, graders run without secrets |
| Log rendering | React SVG component | Crisp, responsive, testable, themeable |
| Hosting | Vercel (frontend) + Railway (backend + Postgres) | Requirement mentions Vercel; Railway simple Django deploy |
| Architecture | Layered monorepo, single Django app, service modules | SOLID separation without multi-app ceremony (KISS) |

## 3. High-Level Design

```
Browser
  └─ React SPA (Vercel) — MUI, Leaflet, SVG logs
       └─ POST /api/trips/ → Django REST API (Railway) — DRF, HOS engine
            ├─ Nominatim  (address → lat/lon)
            ├─ OSRM       (route, distance, duration, geometry)
            └─ PostgreSQL (Trip rows)
```

Map tiles load directly from OSM tile server into Leaflet (browser → OSM, not proxied).

## 4. Repository Layout

```
backend/
  config/                  # settings (env-driven), root urls
  trips/
    models.py              # Trip
    serializers.py         # TripCreateSerializer, TripResponseSerializer
    views.py               # TripViewSet (create, retrieve) — thin
    exceptions.py          # GeocodeError, RoutingError + DRF handler
    services/
      geocoding.py         # Nominatim client
      routing.py           # OSRM client
      hos.py               # pure HOS scheduler — zero Django imports
      planner.py           # TripPlanner: orchestrates geocode → route → hos
    tests/
frontend/
  src/
    api/client.ts          # axios instance, typed endpoint functions
    hooks/useCreateTrip.ts # data | loading | error state
    components/
      TripForm/            # 4 inputs, validation
      RouteMap/            # Leaflet polyline + typed stop pins
      LogSheet/            # SVG daily log grid + duty line
    theme.ts               # MUI theme
```

## 5. API Contract

```
POST /api/trips/        create + compute plan
GET  /api/trips/{id}/   retrieve stored trip (shareable)
GET  /api/docs/         Swagger UI (drf-spectacular)
```

Request:

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Joliet, IL",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 12.5
}
```

Response (201):

```json
{
  "id": "uuid",
  "route": {
    "geometry": "<encoded polyline>",
    "distance_mi": 940.2,
    "duration_hrs": 15.1,
    "stops": [
      {"type": "pickup|dropoff|fuel|break|rest", "lat": 0, "lon": 0,
       "label": "30 min break", "arrival": "ISO8601", "duration_hrs": 0.5}
    ]
  },
  "logs": [
    {"date": "2026-07-14",
     "events": [{"status": "off_duty|sleeper|driving|on_duty",
                 "start": "00:00", "end": "06:30", "note": "..."}],
     "totals": {"off_duty": 10, "sleeper": 0, "driving": 11, "on_duty": 3}}
  ]
}
```

**Security:** serializer validation (cycle 0–70, locations must geocode), DRF anon throttling (~20/hr), CORS allowlist = Vercel domain only, all config via env vars, no secrets required (keyless external APIs). No auth — public demo tool; throttling covers abuse (YAGNI).

**Documentation:** drf-spectacular generates OpenAPI schema from serializers; Swagger UI at `/api/docs/`. Serializer help_text = field docs (DRY).

## 6. HOS Engine (`hos.py`)

Pure, deterministic, no I/O. Core of assessment accuracy grade.

```
plan_trip(legs: list[Leg], cycle_used: float) -> list[DailyLog]

state: clock, driving_today, window_start (14hr), since_break,
       cycle_hrs (8-day rolling), miles_since_fuel

loop over remaining distance in time slices:
  cycle_hrs >= 70            → 34 hr restart (off duty)
  driving_today >= 11
    or 14 hr window elapsed  → 10 hr off-duty, reset day
  since_break >= 8 (driving) → 30 min break (off duty)
  miles_since_fuel >= 1000   → 30 min fuel stop (on duty)
  else                       → drive slice, advance clocks

leg boundaries: pickup, drop-off = 1 hr on_duty events
finalize: events → split at midnights → DailyLog per calendar day
```

Rules implemented: 11 hr driving, 14 hr on-duty window, 30 min break after 8 hrs driving, 70 hr/8 day with 34 hr restart, fuel ≤ 1,000 mi, 1 hr pickup/drop-off. Average speed derived from OSRM leg duration/distance.

## 7. Frontend

Single page, MUI, hooks only. Left panel: `TripForm` (2-col desktop, stacks mobile). Right: `RouteMap` — Leaflet, decoded polyline, color/icon-coded stop markers with popup (type, time, duration). Below: log sheets as horizontally scrollable cards, one `LogSheet` per day.

`LogSheet` SVG: 24-hr grid, four duty rows (off duty, sleeper, driving, on duty), step-line drawn from `events` props, per-row totals column, date header. Pure render from props → snapshot/segment tests trivial.

State: `useCreateTrip` hook wraps `api/client.ts`; components consume `{data, loading, error}`. No global state lib (KISS).

## 8. Error Handling

- Services raise typed exceptions: `GeocodeError(field)`, `RoutingError`.
- One DRF exception handler maps: GeocodeError → 400 `{field, detail}`; RoutingError/timeout → 502 friendly message.
- Frontend: field-level errors under inputs (from DRF detail), MUI Alert for global failures, skeleton loaders during compute.

## 9. Testing

- **Backend (pytest):** `hos.py` unit suite is the bulk — short single-day trip, exact 8 hr break trigger, multi-day, 70 hr exhaustion + restart, fuel-stop spacing, midnight splitting. Serializer validation tests. API tests with mocked service clients (`responses`).
- **Frontend (Vitest + RTL):** TripForm validation, LogSheet segment rendering from fixture plan, useCreateTrip state transitions.
- **CI:** GitHub Actions — both suites on push.

## 10. Deployment

- Frontend: Vercel, env `VITE_API_BASE_URL`.
- Backend: Railway — Django + gunicorn + whitenoise, Railway Postgres, env-driven settings (`DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DEBUG=0`).
- Note: Railway trial credit finite — deploy near submission time.

## 11. Out of Scope (YAGNI)

Auth/accounts, trip editing, multiple drivers, adverse-conditions toggle, sleeper-berth split provisions, real ELD data formats, offline mode.
