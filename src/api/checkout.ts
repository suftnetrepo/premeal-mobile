import { apiClient } from "./client";

export async function createSetupIntent(): Promise<{ clientSecret: string }> {
  const { data } = await apiClient.post<{ clientSecret: string }>("/checkout/setup-intent");
  return data;
}

export type PromoPreview = { discountCents: number; description: string | null };

export async function validatePromoCode(
  code: string,
  restaurantId: string,
  subtotalCents: number
): Promise<PromoPreview> {
  const { data } = await apiClient.post<PromoPreview>("/checkout/validate-promo", {
    code,
    restaurantId,
    subtotalCents,
  });
  return data;
}
