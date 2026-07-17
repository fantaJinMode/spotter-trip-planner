// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { LogSheet } from "./LogSheet";
import { fixtureTrip } from "../../api/fixture";
import { eventsToSegments, transitionDots } from "./logGeometry";

it("renders paper-style grid: dual time scales, black step line, red transition dots", () => {
  const log = fixtureTrip.logs[0];
  render(<LogSheet log={log} />);

  // time scale printed above AND below the grid; Midnight at hour 0 and 24 on each
  expect(screen.getAllByText("Midnight")).toHaveLength(4);
  expect(screen.getAllByText("noon")).toHaveLength(2);

  // numbered row labels like the paper form
  expect(screen.getByText("1: OFF DUTY")).toBeInTheDocument();
  expect(screen.getByText("(NOT DRIVING)")).toBeInTheDocument();

  const svg = screen.getByRole("img", { name: `Daily log for ${log.date}` });
  const blackLines = svg.querySelectorAll("line[stroke='#000']");
  expect(blackLines.length).toBe(eventsToSegments(log.events).length);
  expect(svg.querySelectorAll("circle").length).toBe(transitionDots(log.events).length);
});
