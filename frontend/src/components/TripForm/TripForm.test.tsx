import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { TripForm } from "./TripForm";

it("validates cycle range and submits payload", async () => {
  const onSubmit = vi.fn();
  render(<TripForm onSubmit={onSubmit} loading={false} />);
  await userEvent.type(screen.getByLabelText(/current location/i), "Chicago, IL");
  await userEvent.type(screen.getByLabelText(/pickup/i), "Joliet, IL");
  await userEvent.type(screen.getByLabelText(/dropoff/i), "Dallas, TX");
  await userEvent.type(screen.getByLabelText(/cycle/i), "80");
  expect(screen.getByRole("button", { name: /plan trip/i })).toBeDisabled();
  await userEvent.clear(screen.getByLabelText(/cycle/i));
  await userEvent.type(screen.getByLabelText(/cycle/i), "12.5");
  await userEvent.click(screen.getByRole("button", { name: /plan trip/i }));
  expect(onSubmit).toHaveBeenCalledWith({ current_location: "Chicago, IL",
    pickup_location: "Joliet, IL", dropoff_location: "Dallas, TX", current_cycle_used: 12.5 });
});
