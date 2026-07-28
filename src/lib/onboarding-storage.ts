import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "premeal_onboarding_complete";

/**
 * Same reasoning as token-storage.ts: SecureStore over AsyncStorage for
 * consistency, even though this particular flag isn't sensitive — it keeps
 * all of the app's persisted device state going through one mechanism
 * instead of mixing two storage APIs for no real reason.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === "1";
}

export async function completeOnboarding(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, "1");
}

/**
 * For testing/dev use — reinstalling the app is NOT a reliable way to see
 * onboarding again, since iOS Keychain items (what SecureStore uses) often
 * survive app deletion. This is the actual way to clear the flag.
 */
export async function resetOnboarding(): Promise<void> {
  await SecureStore.deleteItemAsync(ONBOARDING_KEY);
}
