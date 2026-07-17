export const queryKeys = {
  trips: ["trips"],
  trip: (id?: string) => ["trip", id],
} as const;
