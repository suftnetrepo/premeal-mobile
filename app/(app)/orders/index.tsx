import { ActivityIndicator, FlatList } from "react-native";
import { router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable, StyledCard } from "fluent-styles";
import { useMyOrders } from "../../../src/hooks/useOrders";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { COLORS } from "../../../src/theme/colors";
import type { OrderStatus } from "../../../src/api/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
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

const STATUS_COLOR: Record<OrderStatus, string> = {
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

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useMyOrders();

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader
        title="My orders"
        titleAlignment="center"
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={COLORS.bgCard}
        showStatusBar statusBarProps={{ barStyle: "dark-content" }}
        borderBottomWidth={0.5}
        borderBottomColor={COLORS.border}
      />

      {isLoading && (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </Stack>
      )}

      {error && (
        <Stack flex={1} alignItems="center" justifyContent="center" padding={24}>
          <StyledText fontSize={14} color={COLORS.error} textAlign="center">Could not load your orders.</StyledText>
        </Stack>
      )}

      {!isLoading && !error && (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <StyledPressable onPress={() => router.push(`/orders/${item.id}`)}>
              <StyledCard shadow="light" borderRadius={16} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} overflow="hidden">
                <Stack padding={16} gap={8}>
                  <Stack horizontal justifyContent="space-between" alignItems="flex-start">
                    <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary} flex={1}>
                      {item.restaurant.name}
                    </StyledText>
                    <Stack paddingHorizontal={10} paddingVertical={4} borderRadius={999} backgroundColor={`${STATUS_COLOR[item.status]}18`} marginLeft={10}>
                      <StyledText fontSize={11} fontWeight="700" color={STATUS_COLOR[item.status]}>
                        {STATUS_LABEL[item.status]}
                      </StyledText>
                    </Stack>
                  </Stack>
                  <StyledText fontSize={13} color={COLORS.textMuted}>
                    🕐 {formatDate(item.slot.date)} · {item.slot.windowStart}–{item.slot.windowEnd}
                  </StyledText>
                  <Stack horizontal justifyContent="space-between" alignItems="center">
                    <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                      {formatMoney(item.totalCents)}
                    </StyledText>
                    <StyledText fontSize={12} color={COLORS.primary} fontWeight="600">View →</StyledText>
                  </Stack>
                </Stack>
              </StyledCard>
            </StyledPressable>
          )}
          ListEmptyComponent={
            <Stack alignItems="center" paddingTop={80} gap={8}>
              <StyledText fontSize={40}>📋</StyledText>
              <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>No orders yet</StyledText>
              <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">Your order history will appear here.</StyledText>
              <StyledPressable onPress={() => router.replace("/")} marginTop={12} paddingHorizontal={24} paddingVertical={12} borderRadius={999} backgroundColor={COLORS.primary}>
                <StyledText fontSize={14} fontWeight="700" color={COLORS.white}>Browse restaurants</StyledText>
              </StyledPressable>
            </Stack>
          }
        />
      )}
    </StyledPage>
  );
}
