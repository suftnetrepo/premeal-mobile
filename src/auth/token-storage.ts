import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "premeal_auth_token";

/**
 * Wraps expo-secure-store rather than AsyncStorage — SecureStore uses the
 * OS keychain (iOS) / EncryptedSharedPreferences (Android), not plain
 * on-disk storage. Same reasoning as why the web app's session cookie is
 * httpOnly: an auth token shouldn't sit somewhere ordinary app code (or a
 * compromised dependency) could read it in plaintext.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
