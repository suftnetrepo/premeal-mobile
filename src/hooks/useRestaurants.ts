import { useQuery } from "@tanstack/react-query";
import * as restaurantsApi from "../api/restaurants";

export function useRestaurants(location?: { lat: number; lng: number }) {
  return useQuery({
    queryKey: ["restaurants", location ?? "all"],
    queryFn: () => restaurantsApi.getRestaurants(location),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantsApi.getRestaurant(id as string),
    enabled: Boolean(id),
  });
}
