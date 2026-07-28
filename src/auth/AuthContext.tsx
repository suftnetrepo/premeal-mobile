import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { getToken, setToken, clearToken } from "./token-storage";
import { setUnauthorizedHandler } from "../api/client";
import type { User } from "../api/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On launch: if a token is already stored (returning user), validate it
  // against the server rather than trusting it blindly — it may have
  // expired or been invalidated by a password reset elsewhere.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // A 401 from any request (expired/invalidated token) clears the signed-in
  // state here, which the root layout's route guard reacts to by sending
  // the user back to /login — same mechanism as the "log out everywhere"
  // behavior on the web app, just surfaced on this side as a forced logout.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    await setToken(token);
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { user: newUser, token } = await authApi.signup(name, email, password);
    await setToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear local state regardless of whether the server
      // call succeeded, so a network blip never traps someone "logged in"
      // on the device when they explicitly asked to log out.
    }
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
