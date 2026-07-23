import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  hasCompletedOnboarding,
  completeOnboarding as persistOnboardingComplete,
  resetOnboarding as persistOnboardingReset,
} from "../lib/onboarding-storage";

type OnboardingContextValue = {
  /** null while the initial disk read is in flight. */
  hasOnboarded: boolean | null;
  complete: () => Promise<void>;
  /** Dev/testing only — see the "Reset onboarding" row in Account. */
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    hasCompletedOnboarding().then(setHasOnboarded);
  }, []);

  const complete = useCallback(async () => {
    await persistOnboardingComplete();
    // Updating in-memory state here (not just disk) is the whole point of
    // this context — RouteGuard reads hasOnboarded on every render, and a
    // stale local copy that never got told the flag just changed is what
    // was bouncing "Get Started" straight back to /welcome.
    setHasOnboarded(true);
  }, []);

  const reset = useCallback(async () => {
    await persistOnboardingReset();
    setHasOnboarded(false);
  }, []);

  return (
    <OnboardingContext.Provider value={{ hasOnboarded, complete, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within an OnboardingProvider");
  return ctx;
}
