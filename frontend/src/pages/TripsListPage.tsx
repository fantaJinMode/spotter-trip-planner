import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { AppShell } from "../layout/AppShell";
import { useTripsList } from "../hooks/useTripsList";
import type { TripListItem } from "../api/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function TripRow({ trip }: { trip: TripListItem }) {
  return (
    <Paper
      component={RouterLink}
      to={`/trips/${trip.id}`}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 1.5, sm: 0 },
        p: 2,
        textDecoration: "none",
        color: "inherit",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
          {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", textAlign: "left" }}>
          {formatDate(trip.created_at)} · Cycle used {trip.current_cycle_used}h
        </Typography>
      </Box>
      <Stack direction="row" spacing={3} sx={{ flexShrink: 0 }}>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{Math.round(trip.distance_mi)} mi</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Distance</Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{trip.duration_hrs.toFixed(1)} hr</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Duration</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function TripsListPage() {
  const { data, isPending, error } = useTripsList();

  return (
    <AppShell title="Trips List" subtitle="All trips you've planned">
      <Stack spacing={1.5}>
        {isPending ? (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2 }} />)
        ) : error ? (
          <Typography color="error">Couldn't load trips. Try again later.</Typography>
        ) : data && data.length > 0 ? (
          data.map((trip) => <TripRow key={trip.id} trip={trip} />)
        ) : (
          <Box sx={{ textAlign: "center", color: "text.secondary", py: 6 }}>
            <Typography sx={{ mb: 1 }}>No trips planned yet.</Typography>
            <Link component={RouterLink} to="/">
              Plan your first trip
            </Link>
          </Box>
        )}
      </Stack>
    </AppShell>
  );
}
