// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { TripForm } from "./TripForm";

it("validates cycle range and submits payload", async () => {
  const onSubmit = vi.fn();
  render(<TripForm onSubmit={onSubmit} loading={false} />);
  await userEvent.clear(screen.getByLabelText(/current location/i));
  await userEvent.type(screen.getByLabelText(/current location/i), "Chicago, IL");
  await userEvent.clear(screen.getByLabelText(/pickup/i));
  await userEvent.type(screen.getByLabelText(/pickup/i), "Joliet, IL");
  await userEvent.clear(screen.getByLabelText(/dropoff/i));
  await userEvent.type(screen.getByLabelText(/dropoff/i), "Dallas, TX");
  await userEvent.type(screen.getByLabelText(/cycle/i), "80");
  expect(screen.getByRole("button", { name: /plan trip/i })).toBeDisabled();
  await userEvent.clear(screen.getByLabelText(/cycle/i));
  await userEvent.type(screen.getByLabelText(/cycle/i), "12.5");
  await userEvent.click(screen.getByRole("button", { name: /plan trip/i }));
  expect(onSubmit).toHaveBeenCalledWith({ current_location: "Chicago, IL",
    pickup_location: "Joliet, IL", dropoff_location: "Dallas, TX", current_cycle_used: 12.5 });
});

it("blocks submission when pickup and dropoff locations match", async () => {
  const onSubmit = vi.fn();
  render(<TripForm onSubmit={onSubmit} loading={false} />);
  await userEvent.clear(screen.getByLabelText(/pickup/i));
  await userEvent.type(screen.getByLabelText(/pickup/i), "Chicago, IL");
  await userEvent.clear(screen.getByLabelText(/dropoff/i));
  await userEvent.type(screen.getByLabelText(/dropoff/i), "chicago, il");
  expect(screen.getByRole("button", { name: /plan trip/i })).toBeDisabled();
  expect(screen.getByText(/dropoff location must be different from pickup/i)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("disables inputs and shows progress while loading", () => {
  render(<TripForm onSubmit={vi.fn()} loading={true} />);
  expect(screen.getByLabelText(/current location/i)).toBeDisabled();
  expect(screen.getByLabelText(/pickup/i)).toBeDisabled();
  expect(screen.getByLabelText(/dropoff/i)).toBeDisabled();
  expect(screen.getByLabelText(/cycle/i)).toBeDisabled();
  expect(screen.getByRole("button", { name: /planning trip/i })).toBeDisabled();
});

it("pre-fills and disables fields, hides submit, and shows total miles in read-only mode", () => {
  render(
    <TripForm
      onSubmit={vi.fn()}
      loading={false}
      readOnly
      initialValues={{
        current_location: "Chicago, IL",
        pickup_location: "Joliet, IL",
        dropoff_location: "Dallas, TX",
        current_cycle_used: 6,
      }}
      totalMiles={970}
    />,
  );
  expect(screen.getByLabelText(/current location/i)).toHaveValue("Chicago, IL");
  expect(screen.getByLabelText(/current location/i)).toBeDisabled();
  expect(screen.getByLabelText(/pickup/i)).toBeDisabled();
  expect(screen.getByLabelText(/dropoff/i)).toBeDisabled();
  expect(screen.getByLabelText(/cycle/i)).toBeDisabled();
  expect(screen.queryByRole("button", { name: /plan trip/i })).not.toBeInTheDocument();
  expect(screen.getByText(/total miles: 970 mi/i)).toBeInTheDocument();
});
