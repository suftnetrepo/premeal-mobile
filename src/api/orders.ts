import { apiClient } from "./client";
import type { Order } from "./types";

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
