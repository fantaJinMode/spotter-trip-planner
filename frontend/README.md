# Frontend — Spotter Trip Planner

React + TypeScript app for planning HOS-compliant truck trips: a trip input form, a
route map, and FMCSA-style ELD daily log sheets. See the
[root README](../README.md) for the overall project.

## Stack

React 19, TypeScript, Vite, MUI, React Query, Axios, Leaflet/react-leaflet (map),
Vitest + Testing Library (tests).

## Setup

```bash
cd frontend
npm install
cp .env.development .env.development.local   # optional, to override defaults
npm run dev
```

Runs at `http://localhost:5173` and expects the [backend](../backend/) API at
`VITE_API_BASE_URL` (default `http://localhost:8000`).

## Environment variables

- `VITE_API_BASE_URL` — backend API base URL.
- `VITE_USE_MOCK` — set to `1` to use fixture data instead of a live backend
  (`src/api/fixture.ts`), useful for UI work without the backend running.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check and build for production
npm run lint      # oxlint
npm test          # vitest
npm run preview   # preview production build
```

## Structure

- `src/pages/` — routed pages (Dashboard, Trips list, Not Found).
- `src/components/` — `TripForm`, `RouteMap`, `LogSheet`, and shared UI.
- `src/hooks/` — React Query hooks for trip creation/fetching (`useCreateTrip`,
  `useTrip`, `useTripsList`).
- `src/api/` — Axios client, types, and mock fixtures.
- `src/layout/` — app shell, sidebar, topbar, bottom nav.

## Deployment

Deployed to Vercel as a static build (`vercel.json` rewrites all routes to
`index.html` for client-side routing).
