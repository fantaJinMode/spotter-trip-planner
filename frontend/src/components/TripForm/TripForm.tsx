import { useState } from "react";
import { Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import type { TripInput } from "../../api/types";

export interface TripFormProps {
  onSubmit(input: TripInput): void;
  loading: boolean;
  fieldErrors?: Partial<Record<keyof TripInput, string>>;
  initialValues?: TripInput;
  readOnly?: boolean;
  totalMiles?: number;
}

const MIN_CYCLE = 0;
const MAX_CYCLE = 70;

export function TripForm({ onSubmit, loading, fieldErrors, initialValues, readOnly, totalMiles }: TripFormProps) {
  const [currentLocation, setCurrentLocation] = useState(initialValues?.current_location ?? "");
  const [pickupLocation, setPickupLocation] = useState(initialValues?.pickup_location ?? "");
  const [dropoffLocation, setDropoffLocation] = useState(initialValues?.dropoff_location ?? "");
  const [cycleUsed, setCycleUsed] = useState(initialValues?.current_cycle_used?.toString() ?? "");

  const cycleNum = Number(cycleUsed);
  const cycleValid = cycleUsed !== "" && !Number.isNaN(cycleNum) && cycleNum >= MIN_CYCLE && cycleNum <= MAX_CYCLE;
  const sameLocations =
    pickupLocation.trim() !== "" &&
    dropoffLocation.trim() !== "" &&
    pickupLocation.trim().toLowerCase() === dropoffLocation.trim().toLowerCase();
  const isValid =
    currentLocation.trim() !== "" &&
    pickupLocation.trim() !== "" &&
    dropoffLocation.trim() !== "" &&
    cycleValid &&
    !sameLocations;

  const cycleHelperText =
    fieldErrors?.current_cycle_used ??
    (cycleUsed !== "" && !cycleValid ? `Cycle must be between ${MIN_CYCLE} and ${MAX_CYCLE} hours` : undefined);

  const dropoffHelperText =
    fieldErrors?.dropoff_location ?? (sameLocations ? "Dropoff location must be different from pickup" : undefined);

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
          disabled={loading || readOnly}
          fullWidth
        />
        <TextField
          label="Pickup location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          error={Boolean(fieldErrors?.pickup_location)}
          helperText={fieldErrors?.pickup_location}
          disabled={loading || readOnly}
          fullWidth
        />
        <TextField
          label="Dropoff location"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          error={Boolean(fieldErrors?.dropoff_location) || sameLocations}
          helperText={dropoffHelperText}
          disabled={loading || readOnly}
          fullWidth
        />
        <TextField
          label="Current cycle used (hrs)"
          type="number"
          value={cycleUsed}
          onChange={(e) => setCycleUsed(e.target.value)}
          error={Boolean(fieldErrors?.current_cycle_used) || (cycleUsed !== "" && !cycleValid)}
          helperText={cycleHelperText}
          disabled={loading || readOnly}
          fullWidth
        />
        {readOnly ? (
          totalMiles !== undefined ? <Typography variant="body2" color="text.secondary">Total miles: {totalMiles.toLocaleString()} mi</Typography> : null
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? "Planning trip…" : "Plan trip"}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
