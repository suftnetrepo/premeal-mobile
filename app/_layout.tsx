import { useEffect, type ReactNode } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { GlobalPortalProvider, PortalManager } from "fluent-styles";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { CartProvider } from "../src/cart/CartContext";
import { OnboardingProvider, useOnboarding } from "../src/onboarding/OnboardingContext";
import { LocationProvider, useLocation } from "../src/location/LocationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A stale restaurant list or order history for a few seconds is a
      // fine tradeoff against refetching on every screen focus — real
      // freshness for anything time-sensitive (order status) comes from
      // the explicit polling in useOrders.ts, not from this default.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

// Mirrors premeal-app's own behavior: restaurants/[id]/order-form.tsx lets
// anyone browse a restaurant's menu, and only gates the interactive
// "select items and order" part behind login (an inline prompt, not a
// redirect away from the page). Home and restaurant detail stay public
// here for the same reason; everything that actually touches an order —
// basket, checkout, order history, addresses, account — still requires
// being signed in.
const PROTECTED_APP_ROUTES = new Set(["basket", "checkout", "orders", "addresses", "account"]);

/**
 * Expo Router's recommended pattern for protected routes: watch which
 * route group the user is currently in, compare against whether they're
 * signed in, and redirect if those two facts don't match. Screens
 * themselves don't need their own auth checks — this is the one place
 * that decides "are you allowed to see what you're currently looking at."
 *
 * Onboarding is gated the same way, checked first: an unseen-onboarding
 * device gets sent to /welcome regardless of auth state, since that's a
 * one-time thing that should happen before login/signup is even offered.
 * hasOnboarded comes from OnboardingContext (shared, in-memory) rather
 * than this component re-reading disk itself — the welcome screen calling
 * complete() updates that same context, so this guard sees it change on
 * the very next render instead of still thinking onboarding isn't done.
 */
function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { hasOnboarded } = useOnboarding();
  const { active: activeLocation } = useLocation();
 const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;

    const inOnboardingGroup  = segments[0] === "(onboarding)";
    const inAuthGroup        = segments[0] === "(auth)";
    const inAppGroup         = segments[0] === "(app)";
    const currentScreen      = segments[1] ?? "";
    const inProtectedAppRoute = inAppGroup && PROTECTED_APP_ROUTES.has(currentScreen);

    // 1. Onboarding gate — always first
    if (!hasOnboarded && !inOnboardingGroup) {
      router.replace("/welcome");
      return;
    }

    // 2. Auth gate — protected routes need a user
    if (hasOnboarded && !user && inProtectedAppRoute) {
      router.replace("/login");
      return;
    }

    // 3. Auth redirect — logged-in user lands on auth/onboarding screens.
    //    inAuthGroup covers both /login and /signup (segments[0] doesn't
    //    distinguish between them), so this one branch already handles
    //    both entry points, not just login. If they already have a
    //    location set — e.g. they were mid-checkout on Results and got
    //    sent to login — Discover's whole job is "get a location, then
    //    get out of the way" (see index.tsx), so send them straight back
    //    to Results instead of making them re-pick an address they'd
    //    already set.
    if (hasOnboarded && user && (inAuthGroup || inOnboardingGroup)) {
      router.replace(activeLocation ? "/results" : "/");
      return;
    }

    // 4. Nothing else — location routing is handled by index.tsx directly.
    //    index.tsx calls router.push("/results") when a location is selected,
    //    and redirects returning users with a saved location on mount.
    //    Doing it here too caused a race: RouteGuard fired router.replace("/")
    //    right after index.tsx fired router.push("/results"), winning the race
    //    and sending the user back to index instead of results.
  }, [user, isLoading, hasOnboarded, activeLocation, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <GlobalPortalProvider>
          <PortalManager>
            <OnboardingProvider>
              <AuthProvider>
                <LocationProvider>
                  <CartProvider>
                    <RouteGuard>
                      <Stack screenOptions={{ headerShown: false }} />
                    </RouteGuard>
                  </CartProvider>
                </LocationProvider>
              </AuthProvider>
            </OnboardingProvider>
          </PortalManager>
        </GlobalPortalProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}
