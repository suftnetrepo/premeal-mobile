import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { MenuItem, DeliverySlot } from "../api/types";
import { computeUnitPriceCents } from "./cart-utils";

export interface CartLine {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptionIds: string[];
  unitPriceCents: number;
}

type AddLineParams = {
  restaurantId: string;
  restaurantName: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptionIds: string[];
};

type AddLineResult = "added" | "conflict";

type CartContextValue = {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  selectedSlot: DeliverySlot | null;
  setSelectedSlot: (slot: DeliverySlot | null) => void;
  /** Returns "conflict" (and does nothing) if the cart already holds items from a different restaurant. */
  addLine: (params: AddLineParams) => AddLineResult;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeLine: (cartItemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(menuItemId: string, selectedOptionIds: string[]): string {
  return `${menuItemId}::${[...selectedOptionIds].sort().join(",")}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);

  const clearCart = useCallback(() => {
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setSelectedSlot(null);
  }, []);

  const addLine = useCallback(
    (params: AddLineParams): AddLineResult => {
      if (restaurantId && restaurantId !== params.restaurantId && lines.length > 0) {
        return "conflict";
      }

      const unitPriceCents = computeUnitPriceCents(params.menuItem, params.selectedOptionIds);
      const key = lineKey(params.menuItem.id, params.selectedOptionIds);

      setRestaurantId(params.restaurantId);
      setRestaurantName(params.restaurantName);
      setLines((prev) => {
        const existingIndex = prev.findIndex(
          (l) => lineKey(l.menuItem.id, l.selectedOptionIds) === key
        );
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + params.quantity,
          };
          return next;
        }
        return [
          ...prev,
          {
            cartItemId: `${key}-${Date.now()}`,
            menuItem: params.menuItem,
            quantity: params.quantity,
            selectedOptionIds: params.selectedOptionIds,
            unitPriceCents,
          },
        ];
      });
      return "added";
    },
    [restaurantId, lines.length]
  );

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.cartItemId !== cartItemId);
      return prev.map((l) => (l.cartItemId === cartItemId ? { ...l, quantity } : l));
    });
  }, []);

  const removeLine = useCallback((cartItemId: string) => {
    setLines((prev) => prev.filter((l) => l.cartItemId !== cartItemId));
  }, []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0),
    [lines]
  );

  const value: CartContextValue = {
    restaurantId,
    restaurantName,
    lines,
    itemCount,
    subtotalCents,
    selectedSlot,
    setSelectedSlot,
    addLine,
    updateQuantity,
    removeLine,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
