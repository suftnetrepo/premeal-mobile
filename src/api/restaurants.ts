import axios from "axios";
import { apiClient } from "./client";
import type { Restaurant, RestaurantDetail } from "./types";

export async function getRestaurants(location?: { lat: number; lng: number }): Promise<Restaurant[]> {
  const { data } = await apiClient.get<{ restaurants: Restaurant[] }>("/restaurants", {
    params: location ? { lat: location.lat, lng: location.lng } : undefined,
  });
  return data.restaurants;
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  const { data } = await apiClient.get<{ restaurant: RestaurantDetail }>(`/restaurants/${id}`);
  return data.restaurant;
}

/**
 * A restaurant that's paused new orders returns a 409 with
 * { error: "not_accepting_orders", restaurantName } instead of the menu
 * payload — this is owner-controlled and temporary, not a deleted/broken
 * restaurant, so callers should show a "check back later" state rather
 * than a generic error.
 */
export function getNotAcceptingOrdersError(err: unknown): { restaurantName: string } | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 409) return null;
  const data = err.response.data as { error?: string; restaurantName?: string } | undefined;
  if (data?.error !== "not_accepting_orders") return null;
  return { restaurantName: data.restaurantName ?? "This restaurant" };
}
