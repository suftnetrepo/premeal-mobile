import { useMutation } from "@tanstack/react-query";
import * as checkoutApi from "../api/checkout";

export function useCreateSetupIntent() {
  return useMutation({ mutationFn: checkoutApi.createSetupIntent });
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: ({ code, restaurantId, subtotalCents }: { code: string; restaurantId: string; subtotalCents: number }) =>
      checkoutApi.validatePromoCode(code, restaurantId, subtotalCents),
  });
}
