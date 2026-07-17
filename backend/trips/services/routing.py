import requests

from ..exceptions import RoutingError

OSRM_URL = "https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"


def route(origin, destination):
    lat1, lon1 = origin
    lat2, lon2 = destination
    url = OSRM_URL.format(lon1=lon1, lat1=lat1, lon2=lon2, lat2=lat2)
    try:
        resp = requests.get(
            url,
            params={"overview": "full", "geometries": "polyline"},
            timeout=15,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingError(str(exc)) from exc

    data = resp.json()
    if data.get("code") != "Ok":
        raise RoutingError(data.get("code"))

    leg = data["routes"][0]
    geometry = leg["geometry"]
    return {
        "distance_mi": leg["distance"] / 1609.34,
        "duration_hrs": leg["duration"] / 3600,
        "geometry": geometry,
        "coords": _decode_polyline(geometry),
    }


def encode_polyline(coords, precision=5):
    factor = 10 ** precision
    chunks = []
    prev_lat = prev_lon = 0
    for lat, lon in coords:
        lat_i = round(lat * factor)
        lon_i = round(lon * factor)
        chunks.append(_encode_number(lat_i - prev_lat))
        chunks.append(_encode_number(lon_i - prev_lon))
        prev_lat, prev_lon = lat_i, lon_i
    return "".join(chunks)


def _encode_number(num):
    num = num << 1
    if num < 0:
        num = ~num
    out = []
    while num >= 0x20:
        out.append(chr((0x20 | (num & 0x1f)) + 63))
        num >>= 5
    out.append(chr(num + 63))
    return "".join(out)


def _decode_polyline(encoded, precision=5):
    factor = 10 ** precision
    coords = []
    index = lat = lon = 0
    length = len(encoded)

    while index < length:
        result = shift = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        lat += ~(result >> 1) if result & 1 else (result >> 1)

        result = shift = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        lon += ~(result >> 1) if result & 1 else (result >> 1)

        coords.append((lat / factor, lon / factor))
    return coords
