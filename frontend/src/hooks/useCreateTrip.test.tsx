// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, it, expect } from "vitest";
import { fixtureTrip } from "../api/fixture";
vi.mock("../api/client", () => ({ createTrip: vi.fn().mockResolvedValue(fixtureTrip) }));
import { useCreateTrip } from "./useCreateTrip";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

it("exposes data after mutate", async () => {
  const { result } = renderHook(() => useCreateTrip(), { wrapper });
  result.current.mutate({ current_location: "a", pickup_location: "b",
    dropoff_location: "c", current_cycle_used: 0 });
  await waitFor(() => expect(result.current.data?.id).toBe("fixture-001"));
});
