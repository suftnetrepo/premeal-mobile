import { apiClient } from "./client";

export type GeocodeSuggestion = { latitude: number; longitude: number; formattedAddress: string };

export async function suggestAddresses(query: string): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 3) return [];
  const { data } = await apiClient.get<{ suggestions: GeocodeSuggestion[] }>("/geocode/suggest", {
    params: { q: query },
  });
  return data.suggestions;
}

/**
 * One-shot geocode for a full address string — used to get coordinates
 * for a saved address whose latitude/longitude are null (saved before
 * the geocoding was configured, or where it silently failed).
 * Mirrors the POST /api/geocode endpoint in premeal-app.
 */
export async function geocodeAddress(address: string): Promise<GeocodeSuggestion | null> {
  try {
    const { data } = await apiClient.post<{ latitude: number; longitude: number; formattedAddress: string }>(
      "/geocode",
      { address }
    );
    return data;
  } catch {
    return null;
  }
}
