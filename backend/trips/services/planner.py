import math
from datetime import datetime

from . import geocoding, routing
from .hos import Leg, plan_trip


def build_plan(data):
    current = geocoding.geocode(data["current_location"], "current_location")
    pickup = geocoding.geocode(data["pickup_location"], "pickup_location")
    dropoff = geocoding.geocode(data["dropoff_location"], "dropoff_location")

    route_a = routing.route(current, pickup)
    route_b = routing.route(pickup, dropoff)

    legs = [
        Leg(route_a["distance_mi"], route_a["duration_hrs"], service_after=True),
        Leg(route_b["distance_mi"], route_b["duration_hrs"], service_after=True),
    ]
    logs = plan_trip(legs, cycle_used=data["current_cycle_used"], start=datetime.now())

    return {
        "route": {
            "geometry": routing.encode_polyline(route_a["coords"] + route_b["coords"]),
            "distance_mi": route_a["distance_mi"] + route_b["distance_mi"],
            "duration_hrs": route_a["duration_hrs"] + route_b["duration_hrs"],
            "stops": _build_stops(logs, route_a, route_b),
        },
        "logs": logs,
    }


def _event_hours(event):
    def to_hours(hhmm):
        if hhmm == "24:00":
            return 24.0
        h, m = hhmm.split(":")
        return int(h) + int(m) / 60
    return to_hours(event["end"]) - to_hours(event["start"])


def _locate(cum_driving_hrs, leg_specs):
    remaining = cum_driving_hrs
    for duration, coords in leg_specs:
        if remaining <= duration + 1e-9:
            fraction = 0.0 if duration <= 1e-9 else min(remaining / duration, 1.0)
            return _interpolate(coords, fraction)
        remaining -= duration
    return leg_specs[-1][1][-1]


def _interpolate(coords, fraction):
    if len(coords) == 1:
        return coords[0]
    cum = [0.0]
    for a, b in zip(coords, coords[1:]):
        cum.append(cum[-1] + _haversine_mi(a, b))
    target = fraction * cum[-1]
    for i in range(1, len(cum)):
        if cum[i] >= target - 1e-9:
            seg_len = cum[i] - cum[i - 1]
            t = 0.0 if seg_len <= 1e-9 else (target - cum[i - 1]) / seg_len
            lat = coords[i - 1][0] + t * (coords[i][0] - coords[i - 1][0])
            lon = coords[i - 1][1] + t * (coords[i][1] - coords[i - 1][1])
            return (lat, lon)
    return coords[-1]


def _haversine_mi(a, b):
    r = 3958.8
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def _build_stops(logs, route_a, route_b):
    leg_specs = [
        (route_a["duration_hrs"], route_a["coords"]),
        (route_b["duration_hrs"], route_b["coords"]),
    ]
    stops = []
    cum_driving = 0.0
    service_seen = 0

    for day in logs:
        for e in day["events"]:
            hrs = _event_hours(e)
            if e["status"] == "driving":
                cum_driving += hrs
                continue
            lat, lon = _locate(cum_driving, leg_specs)
            if e["note"] == "pickup/dropoff":
                service_seen += 1
                stop_type = "pickup" if service_seen == 1 else "dropoff"
            else:
                stop_type = e["status"]
            stops.append({
                "type": stop_type,
                "note": e["note"],
                "date": day["date"],
                "start": e["start"],
                "end": e["end"],
                "lat": lat,
                "lon": lon,
            })
    return stops
