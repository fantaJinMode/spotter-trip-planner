from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from trips.exceptions import GeocodeError
from trips.models import Trip

FAKE_PLAN = {
    "route": {"geometry": "geom", "distance_mi": 940.0, "duration_hrs": 15.75, "stops": []},
    "logs": [{"date": "2026-07-14", "events": [], "totals": {}}],
}

VALID_PAYLOAD = {
    "current_location": "Chicago, IL",
    "pickup_location": "Joliet, IL",
    "dropoff_location": "Dallas, TX",
    "current_cycle_used": 10,
}


@pytest.mark.django_db
@patch("trips.views.build_plan", return_value=FAKE_PLAN)
def test_create_trip_returns_201_with_route_and_logs(mock_build_plan):
    resp = APIClient().post("/api/trips/", VALID_PAYLOAD, format="json")
    assert resp.status_code == 201
    assert resp.data["route"] == FAKE_PLAN["route"]
    assert resp.data["logs"] == FAKE_PLAN["logs"]
    assert Trip.objects.filter(id=resp.data["id"]).exists()


@pytest.mark.django_db
def test_create_trip_invalid_cycle_used_returns_400():
    payload = {**VALID_PAYLOAD, "current_cycle_used": 80}
    resp = APIClient().post("/api/trips/", payload, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
@patch("trips.views.build_plan", return_value=FAKE_PLAN)
def test_retrieve_trip_returns_200(mock_build_plan):
    create_resp = APIClient().post("/api/trips/", VALID_PAYLOAD, format="json")
    trip_id = create_resp.data["id"]

    resp = APIClient().get(f"/api/trips/{trip_id}/")
    assert resp.status_code == 200
    assert resp.data["id"] == trip_id
    assert resp.data["route"] == FAKE_PLAN["route"]
    assert resp.data["current_location"] == VALID_PAYLOAD["current_location"]
    assert resp.data["pickup_location"] == VALID_PAYLOAD["pickup_location"]
    assert resp.data["dropoff_location"] == VALID_PAYLOAD["dropoff_location"]
    assert resp.data["current_cycle_used"] == VALID_PAYLOAD["current_cycle_used"]


@pytest.mark.django_db
@patch("trips.views.build_plan", side_effect=GeocodeError("pickup_location", "Nowhereville"))
def test_create_trip_geocode_error_returns_400_with_field(mock_build_plan):
    resp = APIClient().post("/api/trips/", VALID_PAYLOAD, format="json")
    assert resp.status_code == 400
    assert "pickup_location" in resp.data


@pytest.mark.django_db
@patch("trips.views.build_plan", return_value=FAKE_PLAN)
def test_list_trips_returns_created_trips_newest_first(mock_build_plan):
    client = APIClient()
    first = client.post("/api/trips/", VALID_PAYLOAD, format="json").data
    second_payload = {**VALID_PAYLOAD, "pickup_location": "Springfield, IL"}
    second = client.post("/api/trips/", second_payload, format="json").data

    resp = client.get("/api/trips/")

    assert resp.status_code == 200
    assert [t["id"] for t in resp.data] == [second["id"], first["id"]]
    assert resp.data[0]["pickup_location"] == "Springfield, IL"
    assert resp.data[0]["distance_mi"] == FAKE_PLAN["route"]["distance_mi"]
    assert resp.data[0]["duration_hrs"] == FAKE_PLAN["route"]["duration_hrs"]
