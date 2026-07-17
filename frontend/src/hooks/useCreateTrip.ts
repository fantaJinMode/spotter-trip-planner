import { useMutation } from "@tanstack/react-query";
import { createTrip } from "../api/client";

export function useCreateTrip() {
  return useMutation({ mutationFn: createTrip });
}
