// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { it, expect, vi } from "vitest";
import { fixtureTripList } from "./api/fixture";

vi.mock("./api/client", () => ({
  listTrips: vi.fn().mockResolvedValue(fixtureTripList),
  createTrip: vi.fn(),
  getTrip: vi.fn(),
}));

import App from "./App";

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

it("shows the Dashboard by default and navigates to Trips List", async () => {
  renderApp();
  expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();

  const [tripsLink] = screen.getAllByRole("link", { name: /trip list/i });
  await userEvent.click(tripsLink);

  expect(await screen.findByRole("heading", { name: "Trips List" })).toBeInTheDocument();
});

it("shows a 404 page for an unmatched route", () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  window.history.pushState({}, "", "/does-not-exist");
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );

  expect(screen.getByText("Page not found")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /go to dashboard/i })).toHaveAttribute("href", "/");
});
