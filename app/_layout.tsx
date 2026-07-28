import { useEffect, type ReactNode } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { GlobalPortalProvider, PortalManager } from "fluent-styles";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { CartProvider } from "../src/cart/CartContext";
import { OnboardingProvider, useOnboarding } from "../src/onboarding/OnboardingContext";
import { LocationProvider } from "../src/location/LocationContext";

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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;

    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedAppRoute = segments[0] === "(app)" && PROTECTED_APP_ROUTES.has(segments[1] ?? "");

    if (!hasOnboarded && !inOnboardingGroup) {
      router.replace("/welcome");
      return;
    }

    if (hasOnboarded) {
      if (!user && inProtectedAppRoute) {
        router.replace("/login");
      } else if (user && (inAuthGroup || inOnboardingGroup)) {
        router.replace("/");
      }
    }
  }, [user, isLoading, hasOnboarded, segments, router]);

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
