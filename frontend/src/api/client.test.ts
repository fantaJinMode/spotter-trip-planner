import { describe, it, expect, vi } from "vitest";
vi.stubEnv("VITE_USE_MOCK", "1");
import { createTrip, getTrip, isNotFoundError } from "./client";
import { fixtureTrip } from "./fixture";

describe("createTrip (mock mode)", () => {
  it("resolves the fixture plan with 2 daily logs", async () => {
    const plan = await createTrip({ current_location: "a", pickup_location: "b",
      dropoff_location: "c", current_cycle_used: 0 });
    expect(plan.logs).toHaveLength(2);
    expect(plan.route.stops[0].type).toBe("start");
  });
});

describe("getTrip (mock mode)", () => {
  it("resolves the fixture trip when the id matches", async () => {
    const trip = await getTrip(fixtureTrip.id);
    expect(trip.id).toBe(fixtureTrip.id);
  });

  it("rejects with a 404-shaped error when the id does not match", async () => {
    await expect(getTrip("does-not-exist")).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 404 },
    });
  });
});

describe("isNotFoundError", () => {
  it("returns true for a 404 axios error", async () => {
    try {
      await getTrip("does-not-exist");
    } catch (err) {
      expect(isNotFoundError(err)).toBe(true);
      return;
    }
    throw new Error("expected getTrip to reject");
  });

  it("returns false for a non-axios error", () => {
    expect(isNotFoundError(new Error("boom"))).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isNotFoundError(undefined)).toBe(false);
  });
});
