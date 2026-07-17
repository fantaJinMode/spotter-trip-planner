import type { LogEvent, DutyStatus } from "../../api/types";

export const GRID_W = 960;
export const ROW_Y: Record<DutyStatus, number> = { off_duty: 20, sleeper: 60, driving: 100, on_duty: 140 };

export const timeToX = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * GRID_W;
};

export interface Seg { x1: number; y1: number; x2: number; y2: number }

export function eventsToSegments(events: LogEvent[]): Seg[] {
  const segs: Seg[] = [];
  events.forEach((e, i) => {
    const y = ROW_Y[e.status];
    segs.push({ x1: timeToX(e.start), y1: y, x2: timeToX(e.end), y2: y });
    const next = events[i + 1];
    if (next && next.status !== e.status)
      segs.push({ x1: timeToX(e.end), y1: y, x2: timeToX(e.end), y2: ROW_Y[next.status] });
  });
  return segs;
}
