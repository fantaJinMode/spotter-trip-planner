import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { LogSheet } from "./LogSheet";
import { fixtureTrip } from "../../api/fixture";
import { eventsToSegments } from "./logGeometry";

it("renders 24 tick labels and a line per segment for fixture day 1", () => {
  const log = fixtureTrip.logs[0];
  render(<LogSheet log={log} />);

  // 25 hour ticks (0..24 inclusive)
  for (const h of [0, 6, 12, 18, 24]) {
    expect(screen.getByText(String(h))).toBeInTheDocument();
  }

  const expectedSegments = eventsToSegments(log.events);
  const svg = screen.getByRole("img", { name: `Daily log for ${log.date}` });
  const lines = svg.querySelectorAll("line[stroke='#0E7C86']");
  expect(lines.length).toBe(expectedSegments.length);
});
