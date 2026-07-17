import requests

from ..exceptions import GeocodeError

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def geocode(query, field):
    resp = requests.get(
        NOMINATIM_URL,
        params={"q": query, "format": "json", "limit": 1},
        headers={"User-Agent": "trip-planner-assessment"},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise GeocodeError(field, query)
    return float(results[0]["lat"]), float(results[0]["lon"])
