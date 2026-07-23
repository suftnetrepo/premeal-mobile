import { apiClient } from "./client";
import type { User } from "./types";

type AuthResponse = { user: User; token: string };

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", {
    name,
    email,
    password,
    role: "CUSTOMER", // this app is the customer client only — see the mobile scope decision
  });
  return data;
}

/** Returns null when not authenticated — the real endpoint doesn't 401 here, it just says who (if anyone) is logged in. */
export async function getMe(): Promise<User | null> {
  const { data } = await apiClient.get<{ user: User | null }>("/auth/me");
  return data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
