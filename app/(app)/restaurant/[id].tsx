import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  StyledPage,
  Stack,
  StyledText,
  dialogueService,
  toastService,
} from "fluent-styles";
import { useRestaurant } from "../../../src/hooks/useRestaurants";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { cuisineEmoji } from "../../../src/lib/cuisines";
import { useCart } from "../../../src/cart/CartContext";
import { useAuth } from "../../../src/auth/AuthContext";
import { MenuItemModal } from "../../../src/components/MenuItemModal";
import { BasketBar } from "../../../src/components/BasketBar";
import { COLORS } from "../../../src/theme/colors";
import {
  ScalePressable,
  FadeImage,
  useFadeUp,
  useSelectPulse,
  SHADOW_SOFT,
  SHADOW_CARD,
  SHADOW_CTA,
} from "../../../src/lib/animations";
import type { DeliverySlot, MenuItem } from "../../../src/api/types";

const HERO_HEIGHT = 260;
const AVATAR_SIZE = 76;

// ─── Small floating circular icon button — back / share / favourite ──────────
function CircleIconButton({
  icon,
  onPress,
  active,
}: {
  icon: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <ScalePressable onPress={onPress} toValue={0.88}>
      <View
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.92)",
            alignItems: "center",
            justifyContent: "center",
          },
          SHADOW_SOFT,
        ]}
      >
        <Icon name={icon as any} size={18} color={active ? COLORS.primary : COLORS.textPrimary} />
      </View>
    </ScalePressable>
  );
}

// ─── Delivery slot chip — gradient when selected, spring pulse ────────────────
function SlotChip({
  slot,
  selected,
  onPress,
}: {
  slot: DeliverySlot;
  selected: boolean;
  onPress: () => void;
}) {
  const disabled = slot.status === "full";
  const pulse = useSelectPulse(selected);
  const availabilityColor = disabled
    ? COLORS.error
    : slot.status === "limited"
      ? COLORS.warning
      : COLORS.success;

  return (
    <ScalePressable onPress={onPress} disabled={disabled} toValue={0.95} style={{ marginRight: 12 }}>
      <Animated.View style={pulse}>
        <View
          style={[
            {
              minWidth: 128,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 4,
              overflow: "hidden",
              backgroundColor: selected ? COLORS.primary : disabled ? COLORS.bgMuted : "#FFFFFF",
              opacity: disabled ? 0.7 : 1,
            },
            selected ? SHADOW_CTA : SHADOW_SOFT,
          ]}
        >
          {selected && (
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={`slot-${slot.id}`} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                  <Stop offset="1" stopColor={COLORS.primaryDark} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#slot-${slot.id})`} />
            </Svg>
          )}
          <StyledText fontSize={14} fontWeight="800" color={selected ? "#FFFFFF" : COLORS.textPrimary}>
            {formatDate(slot.date)}
          </StyledText>
          <StyledText fontSize={12.5} color={selected ? "rgba(255,255,255,0.85)" : COLORS.textMuted}>
            {slot.windowStart}–{slot.windowEnd}
          </StyledText>
          <StyledText
            fontSize={11}
            fontWeight="700"
            color={selected ? "#FFFFFF" : availabilityColor}
          >
            {disabled ? "Full" : slot.status === "limited" ? "Almost full" : "Available"}
          </StyledText>
        </View>
      </Animated.View>
    </ScalePressable>
  );
}

// ─── Menu item card ────────────────────────────────────────────────────────────
function MenuCard({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  return (
    <Stack
      horizontal
      gap={16}
      alignItems="center"
      backgroundColor={COLORS.bgCard}
      borderRadius={24}
      padding={16}
      marginBottom={16}
      style={SHADOW_CARD}
    >
      {item.imageUrl ? (
        <View style={{ width: 84 }}>
          <FadeImage uri={item.imageUrl} height={84} borderRadius={18} />
        </View>
      ) : (
        <Stack
          width={84}
          height={84}
          borderRadius={18}
          backgroundColor={COLORS.primaryLight}
          alignItems="center"
          justifyContent="center"
        >
          <StyledText fontSize={30}>🍽️</StyledText>
        </Stack>
      )}

      <Stack flex={1} gap={4}>
        <StyledText
          fontSize={16.5}
          fontWeight="800"
          color={COLORS.textPrimary}
          numberOfLines={1}
          style={{ letterSpacing: -0.2 }}
        >
          {item.name}
        </StyledText>
        {item.description && (
          <StyledText fontSize={13} color={COLORS.textMuted} numberOfLines={2} lineHeight={18}>
            {item.description}
          </StyledText>
        )}
        <StyledText fontSize={16} fontWeight="800" color={COLORS.primary} style={{ marginTop: 2 }}>
          {formatMoney(item.priceCents)}
        </StyledText>
      </Stack>

      <ScalePressable onPress={onPress} disabled={!item.isAvailable} toValue={0.88}>
        <View
          style={[
            { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
            item.isAvailable ? SHADOW_CTA : undefined,
          ]}
        >
          {item.isAvailable ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id={`add-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                    <Stop offset="1" stopColor={COLORS.primaryDark} stopOpacity={1} />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#add-${item.id})`} />
              </Svg>
              <Icon name="plus" size={20} color="#FFFFFF" />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.bgMuted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="plus" size={20} color={COLORS.textMuted} />
            </View>
          )}
        </View>
      </ScalePressable>
    </Stack>
  );
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const cart = useCart();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [saved, setSaved] = useState(false);

  const heroAnim = useFadeUp(0);
  const infoAnim = useFadeUp(80);
  const menuAnim = useFadeUp(160);

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

  async function handleShare() {
    if (!restaurant) return;
    try {
      await Share.share({
        message: `Check out ${restaurant.name} on Pre-Meal — ${restaurant.cuisine} food, delivered on a schedule you pick.`,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
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
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar={false}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <Animated.View style={heroAnim}>
          <View
            style={{
              height: HERO_HEIGHT,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              overflow: "hidden",
              backgroundColor: COLORS.primaryLight,
            }}
          >
            {restaurant.imageUrl ? (
              <FadeImage uri={restaurant.imageUrl} height={HERO_HEIGHT} />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <StyledText fontSize={64}>{cuisineEmoji(restaurant.cuisine)}</StyledText>
              </View>
            )}

            {/* Legibility gradient for the floating controls + avatar */}
            <Svg style={[StyleSheet.absoluteFill, { top: undefined, height: 150, bottom: 0 }]}>
              <Defs>
                <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#0C0A09" stopOpacity={0} />
                  <Stop offset="1" stopColor="#0C0A09" stopOpacity={0.55} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#hero-fade)" />
            </Svg>

            {/* Floating controls */}
            <View
              style={{
                position: "absolute",
                top: insets.top + 10,
                left: 20,
                right: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CircleIconButton icon="arrow-left" onPress={() => router.back()} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <CircleIconButton icon="share-2" onPress={handleShare} />
                <CircleIconButton
                  icon="heart"
                  active={saved}
                  onPress={() => setSaved((s) => !s)}
                />
              </View>
            </View>
          </View>

          {/* Floating avatar, overlapping the hero */}
          <Stack alignItems="center" style={{ marginTop: -AVATAR_SIZE / 2 }}>
            <View
              style={[
                {
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                },
                SHADOW_CARD,
              ]}
            >
              <StyledText fontSize={32}>{cuisineEmoji(restaurant.cuisine)}</StyledText>
            </View>
          </Stack>
        </Animated.View>

        {/* ── Restaurant info ───────────────────────────────────────── */}
        <Animated.View style={infoAnim}>
          <Stack alignItems="center" paddingHorizontal={24} paddingTop={14} paddingBottom={6} gap={10}>
            <StyledText
              fontSize={28}
              fontWeight="800"
              color={COLORS.textPrimary}
              textAlign="center"
              style={{ letterSpacing: -0.4 }}
            >
              {restaurant.name}
            </StyledText>

            <Stack horizontal alignItems="center" gap={8} flexWrap="wrap" justifyContent="center">
              <StyledText fontSize={15} color={COLORS.textMuted}>
                {restaurant.cuisine}
              </StyledText>
              <StyledText fontSize={13} color={COLORS.border}>
                ·
              </StyledText>
              {restaurant.averageRating !== null ? (
                <Stack horizontal alignItems="center" gap={4}>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                    {restaurant.averageRating.toFixed(1)}
                  </StyledText>
                  <StyledText fontSize={14} color={COLORS.textMuted}>
                    ({restaurant.reviewCount})
                  </StyledText>
                </Stack>
              ) : (
                <StyledText fontSize={15} color={COLORS.textMuted}>
                  New
                </StyledText>
              )}
              <StyledText fontSize={13} color={COLORS.border}>
                ·
              </StyledText>
              <StyledText fontSize={15} color={COLORS.textMuted}>
                Min {formatMoney(restaurant.minOrderCents)}
              </StyledText>
            </Stack>

            {restaurant.description && (
              <StyledText
                fontSize={15}
                color={COLORS.textSecondary}
                textAlign="center"
                lineHeight={21}
                style={{ maxWidth: "92%" }}
              >
                {restaurant.description}
              </StyledText>
            )}
          </Stack>
        </Animated.View>

        {/* ── Delivery slots ────────────────────────────────────────── */}
        <Stack gap={12} paddingTop={18} paddingBottom={8}>
          <StyledText
            fontSize={20}
            fontWeight="700"
            color={COLORS.textPrimary}
            paddingHorizontal={24}
            style={{ letterSpacing: -0.2 }}
          >
            Delivery slots
          </StyledText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {restaurant.deliverySlots.map((slot) => (
              <SlotChip
                key={slot.id}
                slot={slot}
                selected={cart.selectedSlot?.id === slot.id}
                onPress={() => handleSlotSelect(slot)}
              />
            ))}
          </ScrollView>
          {cart.selectedSlot && (
            <StyledText fontSize={12.5} color={COLORS.textMuted} paddingHorizontal={24}>
              Delivery slot selected — you can change it at checkout too.
            </StyledText>
          )}
        </Stack>

        {/* ── Menu ──────────────────────────────────────────────────── */}
        <Animated.View style={menuAnim}>
          <Stack paddingHorizontal={24} paddingTop={20} gap={4}>
            <StyledText
              fontSize={20}
              fontWeight="700"
              color={COLORS.textPrimary}
              marginBottom={14}
              style={{ letterSpacing: -0.2 }}
            >
              Menu
            </StyledText>
            {restaurant.menuItems.map((item) => (
              <MenuCard key={item.id} item={item} onPress={() => handleQuickAdd(item)} />
            ))}
          </Stack>
        </Animated.View>
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
