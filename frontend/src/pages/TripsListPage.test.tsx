import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi, it, expect, beforeEach } from "vitest";
import { fixtureTripList } from "../api/fixture";
import { listTrips } from "../api/client";
import { TripsListPage } from "./TripsListPage";

vi.mock("../api/client", () => ({ listTrips: vi.fn() }));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TripsListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(listTrips).mockResolvedValue(fixtureTripList);
});

it("renders each trip's route summary", async () => {
  renderPage();
  expect(await screen.findByText("Chicago, IL → Joliet, IL → Dallas, TX")).toBeInTheDocument();
});

it("shows an empty state with no trips", async () => {
  vi.mocked(listTrips).mockResolvedValue([]);
  renderPage();
  expect(await screen.findByText(/no trips planned yet/i)).toBeInTheDocument();
});
