import * as SecureStore from "expo-secure-store";
import type { ActiveLocation } from "../location/LocationContext";

/**
 * Persists the user's last-used delivery location across app sessions.
 * Follows the same SecureStore pattern as onboarding-storage.ts — all
 * device-level state goes through one mechanism rather than mixing APIs.
 *
 * The value is JSON-encoded so all ActiveLocation fields survive the round-trip.
 * SecureStore has a ~2KB value limit which is well within range for this payload.
 */
const LOCATION_KEY = "premeal_last_location";

export async function saveLastLocation(loc: ActiveLocation): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCATION_KEY, JSON.stringify(loc));
  } catch {
    // Non-fatal — worst case the user picks their address again next open.
  }
}

export async function loadLastLocation(): Promise<ActiveLocation | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic shape validation — guards against stale/malformed data.
    if (
      typeof parsed?.lat === "number" &&
      typeof parsed?.lng === "number" &&
      typeof parsed?.formattedAddress === "string"
    ) {
      return parsed as ActiveLocation;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearLastLocation(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(LOCATION_KEY);
  } catch {}
}
