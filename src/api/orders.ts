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
