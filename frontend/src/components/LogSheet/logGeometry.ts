import type { LogEvent, DutyStatus } from "../../api/types";

export const HOUR_W = 40;
export const GRID_W = HOUR_W * 24; // 960
export const ROW_H = 50;
export const GRID_H = ROW_H * 4;

// the duty line is drawn through the vertical middle of each row band
export const ROW_Y: Record<DutyStatus, number> = {
  off_duty: ROW_H * 0.5,
  sleeper: ROW_H * 1.5,
  driving: ROW_H * 2.5,
  on_duty: ROW_H * 3.5,
};

export const timeToX = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * GRID_W;
};

export interface Seg { x1: number; y1: number; x2: number; y2: number }
export interface Dot { x: number; y: number }

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

export function transitionDots(events: LogEvent[]): Dot[] {
  const dots: Dot[] = [];
  events.forEach((e, i) => {
    const next = events[i + 1];
    if (next && next.status !== e.status) {
      const x = timeToX(e.end);
      dots.push({ x, y: ROW_Y[e.status] }, { x, y: ROW_Y[next.status] });
    }
  });
  return dots;
}
