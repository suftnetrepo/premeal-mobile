import { ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable, StyledCard, dialogueService, toastService } from "fluent-styles";
import { useOrder, useCancelOrder } from "../../../src/hooks/useOrders";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { apiErrorMessage } from "../../../src/api/client";
import { COLORS } from "../../../src/theme/colors";

const CANCELLABLE = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING"];

const STATUS_LABEL: Record<string, string> = {
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

const STATUS_COLOR: Record<string, string> = {
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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);
  const cancelOrder = useCancelOrder();

  async function handleCancel() {
    if (!order) return;
    const confirmed = await dialogueService.confirm({
      title: "Cancel this order?",
      message: "This can't be undone.",
      confirmLabel: "Cancel order",
      cancelLabel: "Keep order",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await cancelOrder.mutateAsync(order.id);
      toastService.success("Order cancelled");
    } catch (err) {
      toastService.error("Could not cancel", apiErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg}>
        <StyledHeader title="Order" titleAlignment="center" showBackArrow onBackPress={() => router.back()} backgroundColor={COLORS.bgCard} showStatusBar statusBarProps={{ barStyle: "dark-content" }} />
        <Stack flex={1} alignItems="center" justifyContent="center"><ActivityIndicator color={COLORS.primary} size="large" /></Stack>
      </StyledPage>
    );
  }

  if (error || !order) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg}>
        <StyledHeader title="Order" titleAlignment="center" showBackArrow onBackPress={() => router.back()} backgroundColor={COLORS.bgCard} showStatusBar statusBarProps={{ barStyle: "dark-content" }} />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={24}>
          <StyledText fontSize={14} color={COLORS.error} textAlign="center">Could not load this order.</StyledText>
        </Stack>
      </StyledPage>
    );
  }

  const statusColor = STATUS_COLOR[order.status] ?? COLORS.textMuted;

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader
        title={order.restaurant.name}
        titleAlignment="center"
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={COLORS.bgCard}
        showStatusBar statusBarProps={{ barStyle: "dark-content" }}
        borderBottomWidth={0.5}
        borderBottomColor={COLORS.border}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Stack gap={14}>

          {/* Status banner */}
          <Stack backgroundColor={`${statusColor}14`} borderRadius={14} padding={14} borderLeftWidth={3} borderLeftColor={statusColor} borderRadius={0}>
            <StyledText fontSize={14} fontWeight="700" color={statusColor}>{STATUS_LABEL[order.status]}</StyledText>
            <StyledText fontSize={13} color={COLORS.textMuted} marginTop={2}>
              🕐 {formatDate(order.slot.date)}, {order.slot.windowStart}–{order.slot.windowEnd}
            </StyledText>
          </Stack>

          {order.cancelledByRestaurant && order.restaurantCancelReason && (
            <StyledText fontSize={14} color={COLORS.error}>{order.restaurantCancelReason}</StyledText>
          )}

          {/* Items */}
          <StyledCard shadow="light" borderRadius={16} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={16}>
            <StyledText fontSize={14} fontWeight="700" color={COLORS.textMuted} marginBottom={12} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Items
            </StyledText>
            <Stack gap={10}>
              {order.items.map((item) => (
                <Stack key={item.id} horizontal justifyContent="space-between" alignItems="flex-start">
                  <Stack flex={1} gap={2}>
                    <StyledText fontSize={14} fontWeight="600" color={COLORS.textPrimary}>
                      {item.quantity}× {item.nameSnapshot}
                    </StyledText>
                    {item.modifiers.length > 0 && (
                      <StyledText fontSize={12} color={COLORS.textMuted}>
                        {item.modifiers.map((m) => m.optionName).join(", ")}
                      </StyledText>
                    )}
                  </Stack>
                  <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                    {formatMoney(item.priceCents * item.quantity)}
                  </StyledText>
                </Stack>
              ))}
            </Stack>
          </StyledCard>

          {/* Price breakdown */}
          <StyledCard shadow="light" borderRadius={16} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={16}>
            <Stack gap={10}>
              <Stack horizontal justifyContent="space-between">
                <StyledText fontSize={14} color={COLORS.textSecondary}>Subtotal</StyledText>
                <StyledText fontSize={14} color={COLORS.textPrimary}>{formatMoney(order.subtotalCents)}</StyledText>
              </Stack>
              <Stack horizontal justifyContent="space-between">
                <StyledText fontSize={14} color={COLORS.textSecondary}>Delivery</StyledText>
                <StyledText fontSize={14} color={COLORS.textPrimary}>{formatMoney(order.deliveryFeeCents)}</StyledText>
              </Stack>
              {order.discountCents > 0 && (
                <Stack horizontal justifyContent="space-between">
                  <StyledText fontSize={14} color={COLORS.textSecondary}>Discount</StyledText>
                  <StyledText fontSize={14} color={COLORS.success}>-{formatMoney(order.discountCents)}</StyledText>
                </Stack>
              )}
              <Stack borderTopWidth={0.5} borderTopColor={COLORS.border} paddingTop={10} horizontal justifyContent="space-between">
                <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary}>Total</StyledText>
                <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary}>{formatMoney(order.totalCents)}</StyledText>
              </Stack>
            </Stack>
          </StyledCard>

          {/* Delivery address */}
          <Stack paddingHorizontal={4}>
            <StyledText fontSize={13} color={COLORS.textMuted}>📍 {order.deliveryAddress}</StyledText>
          </Stack>

          {/* Cancel */}
          {CANCELLABLE.includes(order.status) && (
            <StyledPressable
              onPress={handleCancel}
              disabled={cancelOrder.isPending}
              alignItems="center"
              paddingVertical={16}
              borderRadius={999}
              borderWidth={1}
              borderColor={COLORS.error}
              marginTop={4}
            >
              {cancelOrder.isPending ? (
                <ActivityIndicator color={COLORS.error} />
              ) : (
                <StyledText fontSize={15} fontWeight="700" color={COLORS.error}>Cancel order</StyledText>
              )}
            </StyledPressable>
          )}
        </Stack>
      </ScrollView>
    </StyledPage>
  );
}
