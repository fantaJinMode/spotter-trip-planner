// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, vi, it, expect } from "vitest";
import { fixtureTrip } from "../api/fixture";

vi.mock("../api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/client")>();
  return {
    ...actual,
    getTrip: vi.fn().mockResolvedValue(fixtureTrip),
    createTrip: vi.fn(),
  };
});

import { DashboardPage } from "./DashboardPage";
import { getTrip, createTrip } from "../api/client";

afterEach(() => {
  vi.mocked(getTrip).mockReset();
  vi.mocked(getTrip).mockResolvedValue(fixtureTrip);
  vi.mocked(createTrip).mockReset();
});

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trips/:id" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

it("shows the empty state with no trip loaded", () => {
  renderAt("/");
  expect(screen.getByText(/plan a trip to see the route/i)).toBeInTheDocument();
});

it("loads and displays a trip from the :id route param", async () => {
  renderAt(`/trips/${fixtureTrip.id}`);
  expect(await screen.findByText(new RegExp(fixtureTrip.logs[0].date))).toBeInTheDocument();
});

it("shows a loaded trip's details as read-only with total miles, no submit button, and a Plan new trip button", async () => {
  renderAt(`/trips/${fixtureTrip.id}`);
  await screen.findByText(new RegExp(fixtureTrip.logs[0].date));

  expect(screen.getByLabelText(/current location/i)).toHaveValue(fixtureTrip.current_location);
  expect(screen.getByLabelText(/pickup/i)).toHaveValue(fixtureTrip.pickup_location);
  expect(screen.getByLabelText(/dropoff/i)).toHaveValue(fixtureTrip.dropoff_location);
  expect(screen.getByLabelText(/cycle/i)).toHaveValue(fixtureTrip.current_cycle_used);
  expect(screen.getByLabelText(/current location/i)).toBeDisabled();
  expect(screen.queryByRole("button", { name: /^plan trip$/i })).not.toBeInTheDocument();
  expect(
    screen.getByText(new RegExp(`total miles: ${fixtureTrip.route.distance_mi}`, "i")),
  ).toBeInTheDocument();

  const planNewButton = screen.getByRole("button", { name: /plan new trip/i });
  const user = userEvent.setup();
  await user.click(planNewButton);

  expect(await screen.findByText(/plan a trip to see the route/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/current location/i)).toHaveValue("");
  expect(screen.getByLabelText(/current location/i)).not.toBeDisabled();
});

it("shows the just-planned trip read-only, then resets on 'Plan new trip'", async () => {
  vi.mocked(createTrip).mockResolvedValue(fixtureTrip);
  const user = userEvent.setup();
  renderAt("/");

  await user.type(screen.getByLabelText(/current location/i), fixtureTrip.current_location);
  await user.type(screen.getByLabelText(/pickup/i), fixtureTrip.pickup_location);
  await user.type(screen.getByLabelText(/dropoff/i), fixtureTrip.dropoff_location);
  await user.type(screen.getByLabelText(/cycle/i), String(fixtureTrip.current_cycle_used));
  await user.click(screen.getByRole("button", { name: /plan trip/i }));

  expect(await screen.findByLabelText(/current location/i)).toHaveValue(fixtureTrip.current_location);
  expect(screen.getByLabelText(/current location/i)).toBeDisabled();
  expect(
    screen.getByText(new RegExp(`total miles: ${fixtureTrip.route.distance_mi}`, "i")),
  ).toBeInTheDocument();

  const planNewButton = screen.getByRole("button", { name: /plan new trip/i });
  await user.click(planNewButton);

  expect(screen.getByLabelText(/current location/i)).toHaveValue("");
  expect(screen.getByLabelText(/current location/i)).not.toBeDisabled();
  expect(screen.queryByRole("button", { name: /plan new trip/i })).not.toBeInTheDocument();
});

it("shows a trip-not-found state when the loaded trip 404s", async () => {
  vi.mocked(getTrip).mockRejectedValueOnce(
    Object.assign(new Error("Not found"), {
      isAxiosError: true,
      response: { status: 404, data: { detail: "Not found." } },
    }),
  );

  renderAt("/trips/does-not-exist");

  expect(await screen.findByText("Trip not found")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /back to trips/i })).toHaveAttribute("href", "/trips");
});
