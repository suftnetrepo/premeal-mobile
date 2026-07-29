import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { useAddresses } from "../hooks/useAddresses";
import { geocodeAddress } from "../api/geocode";
import {
  saveLastLocation,
  loadLastLocation,
  clearLastLocation,
} from "../lib/location-storage";
import type { Address } from "../api/types";

export type ActiveLocation = {
  lat: number;
  lng: number;
  /** Human-readable — the address string or reverse-geocoded label. */
  formattedAddress: string;
  /** The saved address this came from, if any. */
  addressId?: string;
  /** label field from the Address ("Home", "Work", etc.). */
  label?: string | null;
};

type LocationStatus =
  | "loading"       // initial load — checking SecureStore + saved addresses
  | "ready"         // have coordinates, restaurants can be fetched
  | "needs-address" // logged in but no usable location yet
  | "guest";        // not logged in — prompt to set manually

type LocationContextValue = {
  active: ActiveLocation | null;
  status: LocationStatus;
  /** Switch to a different saved address or a manually-typed one. Persists to SecureStore. */
  setActive: (loc: ActiveLocation) => void;
  /** Clear the active location and remove it from SecureStore. */
  clear: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const [active, setActiveState] = useState<ActiveLocation | null>(null);
  const [seeded, setSeeded] = useState(false);

  // ─── Seed priority (highest to lowest) ─────────────────────────────────────
  // 1. SecureStore — last-used location from a previous session (any address,
  //    including one-off typed ones the user never saved to their account).
  //    Checked first so session continuity trumps account defaults.
  // 2. Default saved address with coordinates — reliable, backend-sourced.
  // 3. First saved address with coordinates — fallback if no default.
  // 4. Default saved address geocoded on-the-fly — covers addresses saved
  //    before Mapbox was configured (no stored lat/lng).
  // 5. Nothing → needs-address state.
  useEffect(() => {
    if (authLoading || addressesLoading) return;
    if (seeded) return;

    if (!user) {
      // Not logged in — still check SecureStore for a guest session location
      // (typed address from a previous unauthenticated session).
      loadLastLocation().then((saved) => {
        if (saved) setActiveState(saved);
        setSeeded(true);
      });
      return;
    }

    // Logged-in user — check SecureStore first, then fall back to saved addresses.
    loadLastLocation().then(async (saved) => {
      if (saved) {
        setActiveState(saved);
        setSeeded(true);
        return;
      }

      // No persisted location — seed from saved addresses.
      if (!addresses || addresses.length === 0) {
        setSeeded(true);
        return;
      }

      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

      if (defaultAddr.latitude && defaultAddr.longitude) {
        const loc: ActiveLocation = {
          lat: defaultAddr.latitude,
          lng: defaultAddr.longitude,
          formattedAddress: defaultAddr.address,
          addressId: defaultAddr.id,
          label: defaultAddr.label,
        };
        setActiveState(loc);
        // Persist so it survives the next app kill too.
        saveLastLocation(loc);
        setSeeded(true);
        return;
      }

      // Saved address with no stored coordinates — geocode best-effort.
      const result = await geocodeAddress(defaultAddr.address);
      if (result) {
        const loc: ActiveLocation = {
          lat: result.latitude,
          lng: result.longitude,
          formattedAddress: result.formattedAddress,
          addressId: defaultAddr.id,
          label: defaultAddr.label,
        };
        setActiveState(loc);
        saveLastLocation(loc);
      }
      setSeeded(true);
    });
  }, [user, authLoading, addresses, addressesLoading, seeded]);

  const setActive = useCallback((loc: ActiveLocation) => {
    setActiveState(loc);
    setSeeded(true);
    // Persist immediately — survives app kill.
    saveLastLocation(loc);
  }, []);

  const clear = useCallback(() => {
    setActiveState(null);
    clearLastLocation();
  }, []);

  const status: LocationStatus = (() => {
    if (authLoading || addressesLoading || !seeded) return "loading";
    if (active) return "ready";
    if (!user) return "guest";
    return "needs-address";
  })();

  return (
    <LocationContext.Provider value={{ active, status, setActive, clear }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}

/** Helper — build an ActiveLocation from a saved Address, geocoding if needed. */
export async function locationFromAddress(addr: Address): Promise<ActiveLocation | null> {
  if (addr.latitude && addr.longitude) {
    return {
      lat: addr.latitude,
      lng: addr.longitude,
      formattedAddress: addr.address,
      addressId: addr.id,
      label: addr.label,
    };
  }
  const result = await geocodeAddress(addr.address);
  if (!result) return null;
  return {
    lat: result.latitude,
    lng: result.longitude,
    formattedAddress: result.formattedAddress,
    addressId: addr.id,
    label: addr.label,
  };
}
