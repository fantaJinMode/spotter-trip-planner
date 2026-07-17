import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, it, expect } from "vitest";
import { fixtureTrip } from "../api/fixture";

vi.mock("../api/client", () => ({
  getTrip: vi.fn().mockResolvedValue(fixtureTrip),
  createTrip: vi.fn(),
}));

import { DashboardPage } from "./DashboardPage";

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
  expect(await screen.findByText(fixtureTrip.logs[0].date)).toBeInTheDocument();
});
