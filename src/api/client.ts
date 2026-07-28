import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "../auth/token-storage";

/**
 * Set in .env as EXPO_PUBLIC_API_URL — Expo inlines any EXPO_PUBLIC_*
 * variable at build time automatically, no extra config needed. Must
 * point at your deployed premeal-app instance, or for local dev, your
 * computer's LAN IP + port (NOT "localhost" — that means the phone/
 * simulator itself when the request comes from a physical device or a
 * simulator, not your development machine, unlike in a browser).
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attaches the stored bearer token to every request — this is what
// getCurrentUser() on the backend checks as a fallback when there's no
// cookie (see src/lib/auth.ts on the premeal-app side).
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing, expired, or invalidated (e.g. a
// password reset bumped sessionVersion) — clear it so the app doesn't
// keep sending a token that will never work again. Navigation back to
// the login screen is handled by AuthContext reacting to the cleared
// token, not here, so this file doesn't need to know about routing.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from any API error response, with a sensible fallback. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: unknown } | undefined;
    if (typeof data?.error === "string") return data.error;
  }
  return fallback;
}
