import { useState } from "react";
import { Button, CircularProgress, Paper, Stack, TextField } from "@mui/material";
import type { TripInput } from "../../api/types";

export interface TripFormProps {
  onSubmit(input: TripInput): void;
  loading: boolean;
  fieldErrors?: Partial<Record<keyof TripInput, string>>;
}

const MIN_CYCLE = 0;
const MAX_CYCLE = 70;

export function TripForm({ onSubmit, loading, fieldErrors }: TripFormProps) {
  const [currentLocation, setCurrentLocation] = useState("Chicago, IL");
  const [pickupLocation, setPickupLocation] = useState("Milwaukee, IL");
  const [dropoffLocation, setDropoffLocation] = useState("Indianapolis, IN");
  const [cycleUsed, setCycleUsed] = useState("12");

  const cycleNum = Number(cycleUsed);
  const cycleValid = cycleUsed !== "" && !Number.isNaN(cycleNum) && cycleNum >= MIN_CYCLE && cycleNum <= MAX_CYCLE;
  const isValid =
    currentLocation.trim() !== "" &&
    pickupLocation.trim() !== "" &&
    dropoffLocation.trim() !== "" &&
    cycleValid;

  const cycleHelperText =
    fieldErrors?.current_cycle_used ??
    (cycleUsed !== "" && !cycleValid ? `Cycle must be between ${MIN_CYCLE} and ${MAX_CYCLE} hours` : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      current_location: currentLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      current_cycle_used: cycleNum,
    });
  };

  return (
    <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Current location"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
          error={Boolean(fieldErrors?.current_location)}
          helperText={fieldErrors?.current_location}
          fullWidth
        />
        <TextField
          label="Pickup location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          error={Boolean(fieldErrors?.pickup_location)}
          helperText={fieldErrors?.pickup_location}
          fullWidth
        />
        <TextField
          label="Dropoff location"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          error={Boolean(fieldErrors?.dropoff_location)}
          helperText={fieldErrors?.dropoff_location}
          fullWidth
        />
        <TextField
          label="Current cycle used (hrs)"
          type="number"
          value={cycleUsed}
          onChange={(e) => setCycleUsed(e.target.value)}
          error={Boolean(fieldErrors?.current_cycle_used) || (cycleUsed !== "" && !cycleValid)}
          helperText={cycleHelperText}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={!isValid || loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Plan trip"}
        </Button>
      </Stack>
    </Paper>
  );
}
