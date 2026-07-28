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
  | "loading"       // fetching saved addresses
  | "ready"         // have coordinates, restaurants can be fetched
  | "needs-address" // logged in but no usable address yet
  | "guest";        // not logged in — prompt to set manually

type LocationContextValue = {
  active: ActiveLocation | null;
  status: LocationStatus;
  /** Switch to a different saved address or a manually-typed one. */
  setActive: (loc: ActiveLocation) => void;
  /** Clear — falls back to prompting the user. */
  clear: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const [active, setActiveState] = useState<ActiveLocation | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed from saved addresses when they first load.
  // Priority: default address with coords → first address with coords →
  // default address geocoded on-the-fly → nothing (needs-address).
  useEffect(() => {
    if (authLoading || addressesLoading) return;
    if (!user) { setSeeded(true); return; }
    if (!addresses || addresses.length === 0) { setSeeded(true); return; }
    if (seeded) return; // don't re-seed if user already switched manually

    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

    if (defaultAddr.latitude && defaultAddr.longitude) {
      setActiveState({
        lat: defaultAddr.latitude,
        lng: defaultAddr.longitude,
        formattedAddress: defaultAddr.address,
        addressId: defaultAddr.id,
        label: defaultAddr.label,
      });
      setSeeded(true);
      return;
    }

    // Address exists but has no coords — geocode it best-effort.
    // This covers addresses saved before Mapbox was configured.
    geocodeAddress(defaultAddr.address).then((result) => {
      if (result) {
        setActiveState({
          lat: result.latitude,
          lng: result.longitude,
          formattedAddress: result.formattedAddress,
          addressId: defaultAddr.id,
          label: defaultAddr.label,
        });
      }
      setSeeded(true);
    });
  }, [user, authLoading, addresses, addressesLoading, seeded]);

  const setActive = useCallback((loc: ActiveLocation) => {
    setActiveState(loc);
    setSeeded(true);
  }, []);

  const clear = useCallback(() => {
    setActiveState(null);
  }, []);

  const status: LocationStatus = (() => {
    if (authLoading || addressesLoading || (!seeded && user)) return "loading";
    if (!user) return "guest";
    if (active) return "ready";
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

/** Helper — pick an ActiveLocation from a saved Address, geocoding if needed. */
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
