import { useQuery } from "@tanstack/react-query";
import { listTrips } from "../api/client";
import { queryKeys } from "../constants/queryKeys";

export function useTripsList() {
  return useQuery({
    queryKey: queryKeys.trips,
    queryFn: listTrips,
    refetchInterval: 10 * 60 * 1000,
  });
}
