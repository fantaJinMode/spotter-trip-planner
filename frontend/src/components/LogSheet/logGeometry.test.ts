import { it, expect } from "vitest";
import { eventsToSegments, ROW_Y, timeToX } from "./logGeometry";

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
