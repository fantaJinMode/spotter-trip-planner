import axios from "axios";
import type { TripInput, TripListItem, TripPlan } from "./types";
import { fixtureTrip, fixtureTripList } from "./fixture";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000" });

function useMock() {
  return import.meta.env.VITE_USE_MOCK === "1";
}

export async function createTrip(input: TripInput): Promise<TripPlan> {
  if (useMock()) return new Promise((r) => setTimeout(() => r(fixtureTrip), 600));
  const { data } = await api.post<TripPlan>("/api/trips/", input);
  return data;
}
export async function getTrip(id: string): Promise<TripPlan> {
  if (useMock()) {
    if (id !== fixtureTrip.id) {
      return Promise.reject(
        Object.assign(new Error("Not found"), {
          isAxiosError: true,
          response: { status: 404, data: { detail: "Not found." } },
        }),
      );
    }
    return fixtureTrip;
  }
  const { data } = await api.get<TripPlan>(`/api/trips/${id}/`);
  return data;
}

export async function listTrips(): Promise<TripListItem[]> {
  if (useMock()) return fixtureTripList;
  const { data } = await api.get<TripListItem[]>("/api/trips/");
  return data;
}

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
