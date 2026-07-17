import { useQuery } from "@tanstack/react-query";
import { getTrip } from "../api/client";

export function useTrip(id?: string) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id as string),
    enabled: Boolean(id),
  });
}
