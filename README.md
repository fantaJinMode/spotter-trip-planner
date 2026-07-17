# Spotter Trip Planner

A trip planner for truck drivers that computes FMCSA Hours-of-Service (HOS) compliant
routes and generates ELD daily log sheets from a pickup/dropoff and current cycle hours.

Given a current location, pickup, dropoff, and hours already used in the driver's
70-hour/8-day cycle, the app:
- Geocodes locations and calculates the driving route (distance, duration, geometry).
- Runs a rules engine that schedules driving/on-duty/off-duty/sleeper-berth periods
  according to the 11h driving limit, 14h window, 30-minute break, 10h daily rest,
  70h/8-day cycle, 34h restart, and fuel stops every 1000 miles.
- Returns a route with stops (for map display) and a set of daily logs (for the
  paper-log-style ELD grid).

## Structure

- [backend/](backend/) — Django REST API (trip planning, HOS engine, routing/geocoding).
- [frontend/](frontend/) — React + TypeScript app (trip form, route map, ELD log sheets).
- [docs/](docs/) — design notes and regulatory reference material.

See each app's own README for setup and development instructions.

## Stack

Django REST Framework, PostgreSQL (Neon), OSRM (routing), Nominatim (geocoding) on the
backend; React, TypeScript, Vite, MUI, React Query, and Leaflet on the frontend. Both
apps deploy to Vercel.
