import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import type { Route, Stop } from "../../api/types";
import { stopIcon } from "./stopIcons";

export interface RouteMapProps {
  route: Route;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(positions, { padding: [24, 24] });
  }, [map, positions]);
  return null;
}

function stopLabel(stop: Stop) {
  const base = stop.type.charAt(0).toUpperCase() + stop.type.slice(1);
  return stop.note ? `${base} — ${stop.note}` : base;
}

function stopDurationHrs(stop: Stop) {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return (toMinutes(stop.end) - toMinutes(stop.start)) / 60;
}

function formatArrival(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return `${date} ${time}`;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RouteMap({ route }: RouteMapProps) {
  const stopPositions = useMemo<[number, number][]>(
    () => route.stops.map((s) => [s.lat, s.lon]),
    [route.stops],
  );

  const linePositions = useMemo<[number, number][]>(() => {
    if (route.geometry) {
      try {
        return polyline.decode(route.geometry) as [number, number][];
      } catch {
        // fall through to stop-based fallback
      }
    }
    return stopPositions;
  }, [route.geometry, stopPositions]);

  const center = stopPositions[0] ?? [0, 0];

  return (
    <MapContainer center={center} zoom={6} style={{ height: "100%", minHeight: 400, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={stopPositions} />
      {linePositions.length > 1 && <Polyline positions={linePositions} color="#0E7C86" weight={4} />}
      {route.stops.map((stop, i) => (
        <Marker key={`${stop.type}-${i}`} position={[stop.lat, stop.lon]} icon={stopIcon(stop.type)}>
          <Popup>
            <strong>{stopLabel(stop)}</strong>
            <br />
            {formatArrival(stop.date, stop.start)}
            <br />
            Duration: {stopDurationHrs(stop).toFixed(2)} hr
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
