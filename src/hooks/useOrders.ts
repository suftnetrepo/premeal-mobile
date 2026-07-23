import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "../api/orders";

// Order status can change server-side at any moment (a restaurant
// confirming, declining, or updating delivery status) — this app has no
// push notifications yet (see the web README's "Recommended future
// enhancements"), so polling is the honest way to reflect that instead of
// showing a status that silently goes stale. 15s while a screen is open,
// matching a reasonable "feels live without hammering the API" cadence.
const LIVE_ORDER_POLL_MS = 15_000;

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getMyOrders(),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrder(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const isFinal =
        status === "DELIVERED" || status === "DECLINED" || status === "EXPIRED" || status === "CANCELLED";
      return isFinal ? false : LIVE_ORDER_POLL_MS;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
