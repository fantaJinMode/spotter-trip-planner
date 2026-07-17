import L from "leaflet";
import type { StopType } from "../../api/types";

const COLORS: Record<StopType, string> = {
  start: "#37474f", // charcoal
  pickup: "#2e7d32", // green
  dropoff: "#c62828", // red
  fuel: "#f9a825", // amber
  break: "#1565c0", // blue
  rest: "#6a1b9a", // purple
};

// Glyphs from lucide-static (ISC license): flag, package, map-pin, fuel, coffee, moon
const GLYPHS: Record<StopType, string> = {
  start: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`,
  pickup: `<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>`,
  dropoff: `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
  fuel: `<path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 9h11"/>`,
  break: `<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>`,
  rest: `<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>`,
};

export function stopIcon(type: StopType): L.DivIcon {
  const color = COLORS[type];
  return L.divIcon({
    className: "stop-icon",
    html: `<div style="
      background:${color};
      width:24px;height:24px;border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 2px rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;
    "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[type]}</svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
