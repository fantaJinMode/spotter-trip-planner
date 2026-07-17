import { it, expect } from "vitest";
import { eventsToSegments, ROW_H, ROW_Y, timeToX, transitionDots } from "./logGeometry";

it("maps midnight..midnight to x range 0..960", () => {
  expect(timeToX("00:00")).toBe(0);
  expect(timeToX("24:00")).toBe(960);
  expect(timeToX("06:00")).toBe(240);
});

it("converts events to horizontal+vertical step segments", () => {
  const segs = eventsToSegments([
    { status: "off_duty", start: "00:00", end: "08:00" },
    { status: "driving", start: "08:00", end: "12:00" },
  ]);
  // horizontal on off_duty row, vertical connector, horizontal on driving row
  expect(segs).toEqual([
    { x1: 0, y1: ROW_Y.off_duty, x2: 320, y2: ROW_Y.off_duty },
    { x1: 320, y1: ROW_Y.off_duty, x2: 320, y2: ROW_Y.driving },
    { x1: 320, y1: ROW_Y.driving, x2: 480, y2: ROW_Y.driving },
  ]);
});

it("places ROW_Y at the vertical middle of each 50-unit row band", () => {
  expect(ROW_H).toBe(50);
  expect(ROW_Y.off_duty).toBe(ROW_H * 0.5);
  expect(ROW_Y.sleeper).toBe(ROW_H * 1.5);
  expect(ROW_Y.driving).toBe(ROW_H * 2.5);
  expect(ROW_Y.on_duty).toBe(ROW_H * 3.5);
});

it("emits two red-dot positions per status transition, none for same-status neighbors", () => {
  const dots = transitionDots([
    { status: "off_duty", start: "00:00", end: "08:00" },
    { status: "driving", start: "08:00", end: "12:00" },
    { status: "driving", start: "12:00", end: "13:00" },
  ]);
  expect(dots).toEqual([
    { x: 320, y: ROW_Y.off_duty },
    { x: 320, y: ROW_Y.driving },
  ]);
});
