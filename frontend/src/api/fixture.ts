import type { TripListItem, TripPlan } from "./types";

export const fixtureTrip: TripPlan = {
  id: "fixture-001",
  current_location: "Chicago, IL",
  pickup_location: "Joliet, IL",
  dropoff_location: "Dallas, TX",
  current_cycle_used: 6,
  route: {
    geometry: "", // empty → RouteMap falls back to straight lines between stops
    distance_mi: 970, duration_hrs: 16.25,
    stops: [
      { type: "start", lat: 41.8781, lon: -87.6298, date: "2026-07-14", start: "07:45", end: "08:15", note: "pre-trip inspection" },
      { type: "pickup", lat: 41.525, lon: -88.082, date: "2026-07-14", start: "08:45", end: "09:45", note: "pickup/dropoff" },
      { type: "break", lat: 39.8, lon: -89.65, date: "2026-07-14", start: "17:00", end: "17:30", note: "30 min break" },
      { type: "rest", lat: 38.6, lon: -90.4, date: "2026-07-14", start: "21:15", end: "24:00", note: "10 hr rest" },
      { type: "fuel", lat: 34.7, lon: -92.3, date: "2026-07-15", start: "12:00", end: "12:30", note: "fuel" },
      { type: "dropoff", lat: 32.777, lon: -96.797, date: "2026-07-15", start: "16:45", end: "17:45", note: "pickup/dropoff" },
    ],
  },
  logs: [
    { date: "2026-07-14", events: [
        { status: "off_duty", start: "00:00", end: "08:00" },
        { status: "driving", start: "08:00", end: "08:45", note: "to pickup" },
        { status: "on_duty", start: "08:45", end: "09:45", note: "pickup" },
        { status: "driving", start: "09:45", end: "17:00" },
        { status: "off_duty", start: "17:00", end: "17:30", note: "30 min break" },
        { status: "driving", start: "17:30", end: "21:15" },
        { status: "sleeper", start: "21:15", end: "24:00", note: "10 hr rest" },
      ],
      totals: { off_duty: 8.5, sleeper: 2.75, driving: 11, on_duty: 1 } },
    { date: "2026-07-15", events: [
        { status: "sleeper", start: "00:00", end: "07:15", note: "rest cont." },
        { status: "driving", start: "07:15", end: "12:30" },
        { status: "on_duty", start: "12:30", end: "13:00", note: "fuel" },
        { status: "driving", start: "13:00", end: "16:45" },
        { status: "on_duty", start: "16:45", end: "17:45", note: "dropoff" },
        { status: "off_duty", start: "17:45", end: "24:00" },
      ],
      totals: { off_duty: 6.25, sleeper: 7.25, driving: 9, on_duty: 1.5 } },
  ],
};

export const fixtureTripList: TripListItem[] = [
  {
    id: fixtureTrip.id,
    current_location: "Chicago, IL",
    pickup_location: "Joliet, IL",
    dropoff_location: "Dallas, TX",
    current_cycle_used: 6,
    created_at: "2026-07-14T08:00:00Z",
    distance_mi: fixtureTrip.route.distance_mi,
    duration_hrs: fixtureTrip.route.duration_hrs,
  },
];
