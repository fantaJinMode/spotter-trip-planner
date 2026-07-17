import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Box, Grid, Skeleton, Stack } from "@mui/material";
import { AppShell } from "../layout/AppShell";
import { TripForm } from "../components/TripForm/TripForm";
import { RouteMap } from "../components/RouteMap/RouteMap";
import { LogSheet } from "../components/LogSheet/LogSheet";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useCreateTrip } from "../hooks/useCreateTrip";
import { useTrip } from "../hooks/useTrip";
import type { TripInput } from "../api/types";

const TRIP_INPUT_FIELDS: (keyof TripInput)[] = [
  "current_location",
  "pickup_location",
  "dropoff_location",
  "current_cycle_used",
];

interface DrfErrorBody {
  detail?: string;
  current_location?: string[];
  pickup_location?: string[];
  dropoff_location?: string[];
  current_cycle_used?: string[];
}

function extractFieldErrors(error: unknown): Partial<Record<keyof TripInput, string>> | undefined {
  const maybeAxios = error as { response?: { data?: DrfErrorBody } };
  const data = maybeAxios?.response?.data;
  if (!data) return undefined;

  const fieldErrors: Partial<Record<keyof TripInput, string>> = {};
  for (const field of TRIP_INPUT_FIELDS) {
    const messages = data[field];
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages.join(" ");
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function extractGlobalMessage(error: unknown): string {
  const maybeAxios = error as { response?: { data?: DrfErrorBody }; message?: string };
  const data = maybeAxios?.response?.data;
  if (data?.detail) return data.detail;
  return maybeAxios?.message ?? "Something went wrong planning this trip.";
}

export function DashboardPage() {
  const { id } = useParams<"id">();
  const { mutate, data: createdTrip, error: createError, isPending: isCreating } = useCreateTrip();
  const [lastError, setLastError] = useState<unknown>(null);
  const { data: loadedTrip, error: loadError, isPending: isLoading } = useTrip(id);

  const data = id ? loadedTrip : createdTrip;
  const loading = id ? isLoading : isCreating;

  const handleSubmit = (input: TripInput) => {
    setLastError(null);
    mutate(input, { onError: (err) => setLastError(err) });
  };

  const fieldErrors = id ? undefined : extractFieldErrors(lastError ?? createError);
  const globalError = id ? loadError : fieldErrors ? undefined : lastError ?? createError;

  return (
    <AppShell title="Dashboard" subtitle="Plan a trip and review its route and daily logs">
      {globalError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractGlobalMessage(globalError)}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
          <ErrorBoundary>
            {loading ? (
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            ) : data ? (
              <Box sx={{ height: 400 }}>
                <RouteMap route={data.route} />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                Plan a trip to see the route.
              </Box>
            )}
          </ErrorBoundary>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
          <TripForm onSubmit={handleSubmit} loading={isCreating} fieldErrors={fieldErrors} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <ErrorBoundary>
          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : data ? (
            <Stack spacing={2}>
              {data.logs.map((log) => (
                <LogSheet key={log.date} log={log} />
              ))}
            </Stack>
          ) : null}
        </ErrorBoundary>
      </Box>
    </AppShell>
  );
}
