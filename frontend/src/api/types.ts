export type StopType = "start" | "pickup" | "dropoff" | "fuel" | "break" | "rest";
export type DutyStatus = "off_duty" | "sleeper" | "driving" | "on_duty";

export interface TripInput {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}
export interface Stop {
  type: StopType; lat: number; lon: number;
  date: string; start: string; end: string; note?: string;
}
export interface Route {
  geometry: string; distance_mi: number; duration_hrs: number; stops: Stop[];
}
export interface LogEvent { status: DutyStatus; start: string; end: string; note?: string }
export interface DailyLog {
  date: string; events: LogEvent[];
  totals: Record<DutyStatus, number>;
}
export interface TripPlan extends TripInput {
  id: string;
  route: Route;
  logs: DailyLog[];
}

export interface TripListItem {
  id: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
  created_at: string;
  distance_mi: number;
  duration_hrs: number;
}
