import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, it, expect } from "vitest";
import { fixtureTrip } from "../api/fixture";
vi.mock("../api/client", () => ({ getTrip: vi.fn().mockResolvedValue(fixtureTrip) }));
import { useTrip } from "./useTrip";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

it("fetches a trip by id", async () => {
  const { result } = renderHook(() => useTrip("fixture-001"), { wrapper });
  await waitFor(() => expect(result.current.data?.id).toBe("fixture-001"));
});

it("stays idle when id is undefined", () => {
  const { result } = renderHook(() => useTrip(undefined), { wrapper });
  expect(result.current.fetchStatus).toBe("idle");
});
