import { COLORS } from "../theme/colors";
import type { OrderStatus } from "../api/types";

/**
 * Single source of truth for order status label + colour, shared by the
 * order-detail screen and the order-history list so the two can never say
 * different things about the same status. Mirrors premeal-app's
 * statusLabels / statusStyles in src/app/orders/page.tsx.
 */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: "Awaiting confirmation",
  PAYMENT_ACTION_REQUIRED: "Action needed",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: COLORS.warning,
  PAYMENT_ACTION_REQUIRED: COLORS.error,
  CONFIRMED: COLORS.success,
  DECLINED: COLORS.error,
  EXPIRED: COLORS.textMuted,
  CANCELLED: COLORS.textMuted,
  PREPARING: COLORS.primary,
  OUT_FOR_DELIVERY: COLORS.primary,
  DELIVERED: COLORS.success,
};
