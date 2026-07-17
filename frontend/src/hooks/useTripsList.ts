import { useQuery } from "@tanstack/react-query";
import { listTrips } from "../api/client";

export function useTripsList() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: listTrips,
    refetchInterval: 10 * 60 * 1000,
  });
}
