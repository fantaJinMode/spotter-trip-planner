import { describe, it, expect, vi } from "vitest";
vi.stubEnv("VITE_USE_MOCK", "1");
import { createTrip } from "./client";

describe("createTrip (mock mode)", () => {
  it("resolves the fixture plan with 2 daily logs", async () => {
    const plan = await createTrip({ current_location: "a", pickup_location: "b",
      dropoff_location: "c", current_cycle_used: 0 });
    expect(plan.logs).toHaveLength(2);
    expect(plan.route.stops[0].type).toBe("pickup");
  });
});
