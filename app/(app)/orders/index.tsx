import { useState } from "react";
import { Animated, RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, Stack, StyledText, StyledShape, Loader } from "fluent-styles";
import { useMyOrders } from "../../../src/hooks/useOrders";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { COLORS } from "../../../src/theme/colors";
import { STATUS_LABEL, STATUS_COLOR } from "../../../src/lib/order-status";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD, SHADOW_CTA } from "../../../src/lib/animations";
import type { Order } from "../../../src/api/types";

const H_PAD = 20;

// Exact same filter set as premeal-app's /orders page (src/app/orders/page.tsx):
// 6 chips, "Declined/expired" groups two statuses into one, and PREPARING /
// PAYMENT_ACTION_REQUIRED / CANCELLED are deliberately not their own chip —
// only reachable via "All". Keep in sync with the web version if it changes.
type FilterValue = "ALL" | "PENDING_CONFIRMATION" | "CONFIRMED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "DECLINED";
const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Awaiting confirmation", value: "PENDING_CONFIRMATION" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Declined/expired", value: "DECLINED" },
];

function matchesFilter(order: Order, filter: FilterValue): boolean {
  if (filter === "ALL") return true;
  if (filter === "DECLINED") return order.status === "DECLINED" || order.status === "EXPIRED";
  return order.status === filter;
}

// ─── Filter chips — horizontally scrollable, active = dark pill (same
// active-state language as the bottom tab bar). ────────────────────────────────
function FilterChips({ value, onChange }: { value: FilterValue; onChange: (v: FilterValue) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <ScalePressable key={f.value} onPress={() => onChange(f.value)} toValue={0.95}>
            <Stack
              paddingHorizontal={16}
              paddingVertical={10}
              borderRadius={999}
              backgroundColor={active ? "#1C1917" : "#FFFFFF"}
              style={SHADOW_SOFT}
            >
              <StyledText fontSize={13} fontWeight="700" color={active ? "#FFFFFF" : COLORS.textSecondary}>
                {f.label}
              </StyledText>
            </Stack>
          </ScalePressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Order card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const statusColor = STATUS_COLOR[order.status];
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <ScalePressable onPress={onPress} toValue={0.98} style={{ marginBottom: 18 }}>
      <Stack backgroundColor={COLORS.bgCard} borderRadius={28} padding={20} gap={14} style={[SHADOW_CARD, { elevation: 1.5 }]}>
        <Stack horizontal alignItems="center" gap={14}>
          <StyledShape size={52} cycle backgroundColor={COLORS.primaryLight}>
            <Icon name="shopping-bag" size={21} color={COLORS.primary} />
          </StyledShape>
          <Stack flex={1} gap={4}>
            <StyledText fontSize={16.5} fontWeight="800" color={COLORS.textPrimary} numberOfLines={1} style={{ letterSpacing: -0.2 }}>
              {order.restaurant.name}
            </StyledText>
            <Stack horizontal alignItems="center" gap={6}>
              <Icon name="clock" size={12} color={COLORS.textMuted} />
              <StyledText fontSize={12.5} color={COLORS.textMuted}>
                {formatDate(order.slot.date)} · {order.slot.windowStart}–{order.slot.windowEnd}
              </StyledText>
            </Stack>
          </Stack>
          <Stack backgroundColor={`${statusColor}18`} borderRadius={999} paddingHorizontal={12} paddingVertical={6}>
            <StyledText fontSize={11.5} fontWeight="700" color={statusColor}>
              {STATUS_LABEL[order.status]}
            </StyledText>
          </Stack>
        </Stack>

        <Stack height={1} backgroundColor={COLORS.border} />

        <Stack horizontal alignItems="center" gap={12}>
          <Stack horizontal alignItems="center" gap={10} flex={1}>
            <StyledShape size={34} cycle backgroundColor={COLORS.primaryLight}>
              <Icon name="shopping-bag" size={14} color={COLORS.primary} />
            </StyledShape>
            <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </StyledText>
          </Stack>
          <Stack width={1} height={28} backgroundColor={COLORS.border} />
          <Stack horizontal alignItems="center" gap={10} flex={1.4}>
            <StyledShape size={34} cycle backgroundColor={COLORS.primaryLight}>
              <Icon name="map-pin" size={14} color={COLORS.primary} />
            </StyledShape>
            <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary} numberOfLines={1} style={{ flexShrink: 1 }}>
              {order.deliveryAddress}
            </StyledText>
          </Stack>
        </Stack>

        <Stack horizontal alignItems="center" justifyContent="space-between" marginTop={2}>
          <StyledText fontSize={19} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.3 }}>
            {formatMoney(order.totalCents)}
          </StyledText>
          <Stack horizontal alignItems="center" gap={5}>
            <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>
              View order
            </StyledText>
            <Icon name="arrow-right" size={15} color={COLORS.primary} />
          </Stack>
        </Stack>
      </Stack>
    </ScalePressable>
  );
}

// A distinct component (not inline conditional JSX) so its mount-fade hook
// is called unconditionally within its own render — and remounting it via
// `key={filter}` at the call site gives every filter switch a fresh, subtle
// fade-in instead of an abrupt swap.
function OrderList({ orders }: { orders: Order[] }) {
  const anim = useFadeUp(0);
  return (
    <Animated.View style={anim}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onPress={() => router.push(`/orders/${order.id}`)} />
      ))}
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const { data: orders, isLoading, isRefetching, refetch, error } = useMyOrders();
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const filtered = (orders ?? []).filter((o) => matchesFilter(o, filter));

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={H_PAD} paddingTop={8} paddingBottom={4}>
          <ScalePressable onPress={() => router.back()} toValue={0.88}>
            <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
              <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
            </Stack>
          </ScalePressable>
          <Stack flex={1} alignItems="center" gap={2} paddingHorizontal={8}>
            <StyledText fontSize={20} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.3 }}>
              My orders
            </StyledText>
            <StyledText fontSize={12.5} color={COLORS.textMuted}>
              Your past orders
            </StyledText>
          </Stack>
          <ScalePressable onPress={() => router.push("/account")} toValue={0.88}>
            <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
              <Icon name="settings" size={18} color={COLORS.primary} />
            </Stack>
          </ScalePressable>
        </Stack>
      </StyledPage.Header.Full>

      {isLoading && (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Loader variant="spinner" color={COLORS.primary} />
        </Stack>
      )}

      {error && (
        <Stack flex={1} alignItems="center" justifyContent="center" padding={24}>
          <StyledText fontSize={14} color={COLORS.error} textAlign="center">
            Could not load your orders.
          </StyledText>
        </Stack>
      )}

      {!isLoading && !error && (
        <ScrollView
          contentContainerStyle={{ padding: H_PAD, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
        >
          {(orders ?? []).length > 0 && (
            <Stack marginBottom={20}>
              <FilterChips value={filter} onChange={setFilter} />
            </Stack>
          )}

          {(orders ?? []).length === 0 ? (
            <Stack alignItems="center" paddingTop={60} paddingHorizontal={24} gap={14}>
              <StyledShape size={92} cycle backgroundColor={COLORS.primaryLight}>
                <Icon name="shopping-bag" size={36} color={COLORS.primary} />
              </StyledShape>
              <StyledText fontSize={18} fontWeight="800" color={COLORS.textPrimary} textAlign="center">
                No orders yet
              </StyledText>
              <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
                Start exploring restaurants and place your first order.
              </StyledText>
              <ScalePressable onPress={() => router.replace("/")} toValue={0.96}>
                <Stack
                  backgroundColor={COLORS.primary}
                  borderRadius={999}
                  paddingHorizontal={24}
                  paddingVertical={14}
                  marginTop={4}
                  style={SHADOW_CTA}
                >
                  <StyledText fontSize={14.5} fontWeight="700" color={COLORS.white}>
                    Browse restaurants
                  </StyledText>
                </Stack>
              </ScalePressable>
            </Stack>
          ) : filtered.length === 0 ? (
            <Stack alignItems="center" paddingTop={48} gap={8}>
              <Icon name="inbox" size={28} color={COLORS.border} />
              <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
                No orders match this filter.
              </StyledText>
            </Stack>
          ) : (
            <OrderList key={filter} orders={filtered} />
          )}
        </ScrollView>
      )}
    </StyledPage>
  );
}
