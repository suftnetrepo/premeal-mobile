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
