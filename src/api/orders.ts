import { apiClient } from "./client";
import type { Order } from "./types";

export type SubmitReviewInput = {
  rating: number; // 1-5, validated server-side too (zod: z.number().int().min(1).max(5))
  comment?: string; // server caps at 1000 chars (zod: z.string().max(1000))
};

export type Review = { id: string; rating: number; comment: string | null; createdAt: string };

export type CreateOrderInput = {
  restaurantId: string;
  slotId: string;
  deliveryAddress: string;
  stripePaymentMethodId: string;
  promoCode?: string;
  notes?: string;
  items: { menuItemId: string; quantity: number; selectedOptionIds: string[] }[];
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await apiClient.post<{ order: Order }>("/orders", input);
  return data.order;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ orders: Order[] }>("/orders/mine");
  return data.orders;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
}

export async function cancelOrder(id: string): Promise<void> {
  await apiClient.post(`/orders/${id}/cancel`);
}

// Mirrors premeal-app's POST /api/orders/[id]/review (src/lib/reviews.ts):
// only allowed once an order is DELIVERED, one review per order (409 if one
// already exists), no edit/delete — a customer gets one shot.
export async function submitReview(orderId: string, input: SubmitReviewInput): Promise<Review> {
  const { data } = await apiClient.post<{ review: Review }>(`/orders/${orderId}/review`, input);
  return data.review;
}

export type PaymentActionSecret = { clientSecret: string; paymentMethodId: string | null };

// Mirrors premeal-app's GET /api/orders/[id]/payment-action (src/lib/payment-actions.ts):
// 401 not logged in, 403 not your order, 409 the order isn't actually
// PAYMENT_ACTION_REQUIRED. Returns the existing PaymentIntent's client
// secret plus its payment method id — Stripe detaches the payment method
// from a PaymentIntent that failed off-session with authentication_required,
// so the client has to re-supply that id explicitly to resume it, rather
// than assuming it's still attached.
export async function getPaymentActionSecret(orderId: string): Promise<PaymentActionSecret> {
  const { data } = await apiClient.get<PaymentActionSecret>(`/orders/${orderId}/payment-action`);
  return data;
}

export type CompletePaymentActionResult = { status: "succeeded" | "failed" | "still_requires_action" };

// Mirrors premeal-app's POST /api/orders/[id]/complete-payment-action.
// Re-verifies with Stripe server-side rather than trusting the client —
// this call is what actually flips the order to CONFIRMED or DECLINED.
export async function completePaymentAction(orderId: string): Promise<CompletePaymentActionResult> {
  const { data } = await apiClient.post<CompletePaymentActionResult>(`/orders/${orderId}/complete-payment-action`);
  return data;
}
