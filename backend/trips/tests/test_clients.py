import pytest
import responses

from trips.exceptions import GeocodeError, RoutingError
from trips.services.geocoding import geocode
from trips.services.routing import route


@responses.activate
def test_geocode_returns_lat_lon():
    responses.add(
        responses.GET,
        "https://nominatim.openstreetmap.org/search",
        json=[{"lat": "41.8781", "lon": "-87.6298"}],
        status=200,
    )
    lat, lon = geocode("Chicago, IL", field="current_location")
    assert lat == pytest.approx(41.8781)
    assert lon == pytest.approx(-87.6298)


@responses.activate
def test_geocode_empty_result_raises_geocode_error():
    responses.add(
        responses.GET,
        "https://nominatim.openstreetmap.org/search",
        json=[],
        status=200,
    )
    with pytest.raises(GeocodeError):
        geocode("Nowhereville", field="pickup_location")


@responses.activate
def test_route_returns_distance_duration_geometry_coords():
    responses.add(
        responses.GET,
        "https://router.project-osrm.org/route/v1/driving/-87.6298,41.8781;-96.797,32.7767",
        json={
            "code": "Ok",
            "routes": [{
                "distance": 1609340.0,   # meters -> 1000 mi
                "duration": 36000.0,     # seconds -> 10 hrs
                "geometry": "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
            }],
        },
        status=200,
    )
    result = route((41.8781, -87.6298), (32.7767, -96.797))
    assert result["distance_mi"] == pytest.approx(1000, rel=1e-3)
    assert result["duration_hrs"] == pytest.approx(10, rel=1e-3)
    assert result["geometry"] == "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
    assert result["coords"] == [
        (38.5, -120.2), (40.7, -120.95), (43.252, -126.453),
    ]


@responses.activate
def test_route_non_ok_raises_routing_error():
    responses.add(
        responses.GET,
        "https://router.project-osrm.org/route/v1/driving/-87.6298,41.8781;-96.797,32.7767",
        json={"code": "NoRoute", "routes": []},
        status=200,
    )
    with pytest.raises(RoutingError):
        route((41.8781, -87.6298), (32.7767, -96.797))
