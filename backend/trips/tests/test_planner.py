from unittest.mock import patch

from trips.services.planner import build_plan
from trips.services.routing import _decode_polyline

ROUTE_A_COORDS = [(41.8781, -87.6298), (41.5, -88.0), (41.0, -88.5)]
ROUTE_B_COORDS = [(41.0, -88.5), (39.0, -90.0), (36.0, -94.0), (32.7767, -96.797)]

LOCATIONS = {
    "Chicago, IL": (41.8781, -87.6298),
    "Joliet, IL": (41.0, -88.5),
    "Dallas, TX": (32.7767, -96.797),
}


def fake_geocode(query, field):
    return LOCATIONS[query]


def fake_route(origin, destination):
    if origin == LOCATIONS["Chicago, IL"]:
        return {"distance_mi": 40.0, "duration_hrs": 0.75, "geometry": "geomA", "coords": ROUTE_A_COORDS}
    return {"distance_mi": 900.0, "duration_hrs": 15.0, "geometry": "geomB", "coords": ROUTE_B_COORDS}


@patch("trips.services.planner.routing.route", side_effect=fake_route)
@patch("trips.services.planner.geocoding.geocode", side_effect=fake_geocode)
def test_build_plan_returns_route_stops_and_logs(mock_geocode, mock_route):
    data = {
        "current_location": "Chicago, IL",
        "pickup_location": "Joliet, IL",
        "dropoff_location": "Dallas, TX",
        "current_cycle_used": 0,
    }
    plan = build_plan(data)

    assert plan["logs"]
    decoded = _decode_polyline(plan["route"]["geometry"])
    expected = ROUTE_A_COORDS + ROUTE_B_COORDS
    assert len(decoded) == len(expected)
    for (lat, lon), (exp_lat, exp_lon) in zip(decoded, expected):
        assert abs(lat - exp_lat) < 1e-4
        assert abs(lon - exp_lon) < 1e-4

    stops = plan["route"]["stops"]
    types = [s["type"] for s in stops]
    assert "pickup" in types
    assert "dropoff" in types
    for s in stops:
        assert -90 <= s["lat"] <= 90
        assert -180 <= s["lon"] <= 180
