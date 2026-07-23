import { useState } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  StyledPage,
  Stack,
  StyledText,
  StyledPressable,
  StyledCard,
  StyledHeader,
  StyledImage,
  StyledImageBackground,
  dialogueService,
  toastService,
} from "fluent-styles";
import { useRestaurant } from "../../../src/hooks/useRestaurants";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { useCart } from "../../../src/cart/CartContext";
import { useAuth } from "../../../src/auth/AuthContext";
import { MenuItemModal } from "../../../src/components/MenuItemModal";
import { BasketBar } from "../../../src/components/BasketBar";
import { COLORS } from "../../../src/theme/colors";
import type { DeliverySlot, MenuItem } from "../../../src/api/types";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const cart = useCart();
  const { user } = useAuth();
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  // Mirrors premeal-app's restaurants/[id]/order-form.tsx: browsing the
  // menu is public, but the moment someone tries to actually build an
  // order (add an item, pick a slot), an inline prompt asks them to log
  // in — not a redirect away from the page they were already looking at.
  async function ensureAuthenticated(): Promise<boolean> {
    if (user) return true;
    const confirmed = await dialogueService.confirm({
      title: "Log in to order",
      message: `Log in to order from ${restaurant?.name ?? "this restaurant"}.`,
      confirmLabel: "Log in",
      cancelLabel: "Not now",
    });
    if (confirmed) router.push("/login");
    return false;
  }

  // If the basket already holds items from a different restaurant, this
  // platform (like Just Eat) keeps one basket per restaurant — confirm
  // before silently wiping someone's in-progress order.
  async function ensureRestaurant(): Promise<boolean> {
    if (!restaurant) return false;
    if (cart.restaurantId && cart.restaurantId !== restaurant.id && cart.lines.length > 0) {
      const confirmed = await dialogueService.confirm({
        title: "Start a new basket?",
        message: `Your basket has items from ${cart.restaurantName}. Adding from ${restaurant.name} will clear it.`,
        confirmLabel: "Start new basket",
        cancelLabel: "Cancel",
        destructive: true,
      });
      if (!confirmed) return false;
      cart.clearCart();
    }
    return true;
  }

  async function handleQuickAdd(item: MenuItem) {
    if (!restaurant || !item.isAvailable) return;
    if (!(await ensureAuthenticated())) return;
    if (!(await ensureRestaurant())) return;

    if ((item.modifierGroups?.length ?? 0) > 0) {
      setModalItem(item);
      return;
    }
    const result = cart.addLine({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      menuItem: item,
      quantity: 1,
      selectedOptionIds: [],
    });
    if (result === "added") toastService.success(`Added ${item.name}`);
  }

  function handleModalAdd(selectedOptionIds: string[], quantity: number) {
    if (!restaurant || !modalItem) return;
    const result = cart.addLine({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      menuItem: modalItem,
      quantity,
      selectedOptionIds,
    });
    if (result === "added") {
      toastService.success(`Added ${modalItem.name}`);
      setModalItem(null);
    }
  }

  async function handleSlotSelect(slot: DeliverySlot) {
    if (!restaurant || slot.status === "full") return;
    if (!(await ensureAuthenticated())) return;
    if (!(await ensureRestaurant())) return;
    cart.setSelectedSlot(cart.selectedSlot?.id === slot.id ? null : slot);
  }

  if (isLoading) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg} alignItems="center" justifyContent="center">
        <ActivityIndicator color={COLORS.primary} size="large" />
      </StyledPage>
    );
  }

  if (error || !restaurant) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg} alignItems="center" justifyContent="center" padding={24}>
        <StyledText fontSize={15} color={COLORS.error} textAlign="center">
          Could not load this restaurant.
        </StyledText>
      </StyledPage>
    );
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader
        title={restaurant.name}
        titleAlignment="center"
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={COLORS.bgCard}
        showStatusBar statusBarProps={{ barStyle: "dark-content" }}
        borderBottomWidth={0.5}
        borderBottomColor={COLORS.border}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* TEMP placeholder — same seeded-picsum approach used elsewhere
            until real restaurant photography exists. */}
        <StyledImageBackground
          source={{
            uri: restaurant.imageUrl ?? `https://picsum.photos/seed/premeal-r-${restaurant.id}/900/500`,
          }}
          height={170}
        />

        <Stack padding={20} gap={6}>
          <StyledText fontSize={22} fontWeight="800" color={COLORS.textPrimary}>
            {restaurant.name}
          </StyledText>
          <StyledText fontSize={14} color={COLORS.textMuted}>
            {restaurant.cuisine} · Min {formatMoney(restaurant.minOrderCents)}
            {restaurant.averageRating !== null
              ? ` · ★ ${restaurant.averageRating.toFixed(1)} (${restaurant.reviewCount})`
              : " · New"}
          </StyledText>
          {restaurant.description && (
            <StyledText fontSize={14} color={COLORS.textSecondary} lineHeight={20}>
              {restaurant.description}
            </StyledText>
          )}
        </Stack>

        <Stack gap={10} paddingBottom={8}>
          <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary} paddingHorizontal={20}>
            Delivery slots
          </StyledText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {restaurant.deliverySlots.map((slot) => {
              const selected = cart.selectedSlot?.id === slot.id;
              const disabled = slot.status === "full";
              const statusColor =
                disabled ? COLORS.error : slot.status === "limited" ? COLORS.warning : COLORS.success;
              return (
                <StyledPressable
                  key={slot.id}
                  onPress={() => handleSlotSelect(slot)}
                  paddingHorizontal={14}
                  paddingVertical={10}
                  borderRadius={12}
                  borderWidth={selected ? 2 : 1}
                  borderColor={selected ? COLORS.primary : COLORS.border}
                  backgroundColor={selected ? COLORS.primaryLight : COLORS.bgCard}
                  style={{ opacity: disabled ? 0.45 : 1, minWidth: 110 }}
                >
                  <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
                    {formatDate(slot.date)}
                  </StyledText>
                  <StyledText fontSize={12} color={COLORS.textMuted}>
                    {slot.windowStart}–{slot.windowEnd}
                  </StyledText>
                  <StyledText fontSize={11} fontWeight="700" color={statusColor}>
                    {disabled ? "Full" : slot.status === "limited" ? "Almost full" : "Available"}
                  </StyledText>
                </StyledPressable>
              );
            })}
          </ScrollView>
          {cart.selectedSlot && (
            <StyledText fontSize={12} color={COLORS.textMuted} paddingHorizontal={20}>
              Delivery slot selected — you can change it at checkout too.
            </StyledText>
          )}
        </Stack>

        <Stack padding={20} gap={12}>
          <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>
            Menu
          </StyledText>
          {restaurant.menuItems.map((item) => (
            <StyledCard
              key={item.id}
              shadow="light"
              borderRadius={16}
              padding={14}
              backgroundColor={COLORS.bgCard}
              borderWidth={1}
              borderColor={COLORS.border}
            >
              <Stack horizontal gap={12} alignItems="center">
                <Stack flex={1} gap={4}>
                  <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                    {item.name}
                  </StyledText>
                  {item.description && (
                    <StyledText fontSize={13} color={COLORS.textMuted} numberOfLines={2}>
                      {item.description}
                    </StyledText>
                  )}
                  <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>
                    {formatMoney(item.priceCents)}
                  </StyledText>
                </Stack>

                {item.imageUrl && (
                  <StyledImage source={{ uri: item.imageUrl }} width={64} height={64} borderRadius={12} />
                )}

                <StyledPressable
                  onPress={() => handleQuickAdd(item)}
                  width={36}
                  height={36}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={item.isAvailable ? COLORS.primary : COLORS.bgMuted}
                  style={{ opacity: item.isAvailable ? 1 : 0.5 }}
                >
                  <StyledText fontSize={20} fontWeight="700" color={item.isAvailable ? COLORS.white : COLORS.textMuted}>
                    +
                  </StyledText>
                </StyledPressable>
              </Stack>
            </StyledCard>
          ))}
        </Stack>
      </ScrollView>

      <BasketBar />

      <MenuItemModal
        visible={!!modalItem}
        menuItem={modalItem}
        onClose={() => setModalItem(null)}
        onAdd={handleModalAdd}
      />
    </StyledPage>
  );
}
