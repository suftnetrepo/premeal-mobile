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

// Opaque tint to sit behind STATUS_COLOR text/icons — an alpha-blended
// version of STATUS_COLOR looks the same in isolation, but a translucent
// background paired with the card's elevation lets Android's shadow show
// through as a visible rectangular patch. These are flat, fully-opaque
// colours instead, same ones used by the other status-tinted cards.
export const STATUS_COLOR_LIGHT: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: COLORS.warningLight,
  PAYMENT_ACTION_REQUIRED: COLORS.errorLight,
  CONFIRMED: COLORS.successLight,
  DECLINED: COLORS.errorLight,
  EXPIRED: COLORS.bgMuted,
  CANCELLED: COLORS.bgMuted,
  PREPARING: COLORS.primaryLight,
  OUT_FOR_DELIVERY: COLORS.primaryLight,
  DELIVERED: COLORS.successLight,
};
