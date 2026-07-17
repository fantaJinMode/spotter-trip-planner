import { useQuery } from "@tanstack/react-query";
import { getTrip, isNotFoundError } from "../api/client";
import { queryKeys } from "../constants/queryKeys";

export function useTrip(id?: string) {
  return useQuery({
    queryKey: queryKeys.trip(id),
    queryFn: () => getTrip(id as string),
    enabled: Boolean(id),
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3,
  });
}
