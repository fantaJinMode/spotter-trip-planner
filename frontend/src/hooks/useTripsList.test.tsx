// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, it, expect } from "vitest";
import { fixtureTripList } from "../api/fixture";
vi.mock("../api/client", () => ({ listTrips: vi.fn().mockResolvedValue(fixtureTripList) }));
import { useTripsList } from "./useTripsList";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

it("exposes the trips list after fetching", async () => {
  const { result } = renderHook(() => useTripsList(), { wrapper });
  await waitFor(() => expect(result.current.data).toEqual(fixtureTripList));
});
