import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as addressesApi from "../api/addresses";
import { useAuth } from "../auth/AuthContext";

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAddresses(),
    // Guests were never going to have saved addresses — /api/addresses is
    // intentionally 401-gated server-side (confirmed against the actual
    // backend route), so without this guard every screen that opens the
    // address picker fires a doomed request every single time, for every
    // guest, forever. Not broken (the empty-state fallback already
    // handles the failure gracefully), just wasteful.
    enabled: !!user,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.createAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}
