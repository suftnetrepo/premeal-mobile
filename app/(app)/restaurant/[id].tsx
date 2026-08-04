import { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather as Icon, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  StyledPage,
  Stack,
  StyledText,
  dialogueService,
  toastService,
  StyledImageBackground,
  StyledShape,
  StyledImage,
  theme,
  Loader,
} from "fluent-styles";
import { useRestaurant } from "../../../src/hooks/useRestaurants";
import { getNotAcceptingOrdersError } from "../../../src/api/restaurants";
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
      <Stack
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(255,255,255,0.92)"
        style={SHADOW_SOFT}
      >
        <Icon
          name={icon as any}
          size={18}
          color={active ? COLORS.primary : COLORS.textPrimary}
        />
      </Stack>
    </ScalePressable>
  );
}

// ─── Delivery slot chip — orange outline when selected, spring pulse ──────────
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
  const availabilityColor = disabled
    ? COLORS.error
    : slot.status === "limited"
      ? COLORS.warning
      : COLORS.success;

  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      toValue={0.95}
      style={{ marginRight: 12 }}
    >
      <Stack
        minWidth={132}
        borderRadius={20}
        borderWidth={selected ? 2 : 0}
        borderColor={COLORS.primary}
        paddingHorizontal={16}
        paddingVertical={14}
        gap={5}
        backgroundColor={disabled ? COLORS.bgMuted : theme.colors.gray[1]}
        style={[{ opacity: disabled ? 0.7 : 1 }, SHADOW_SOFT]}
      >
        <StyledText fontSize={14} fontWeight="800" color={COLORS.textPrimary}>
          {formatDate(slot.date)}
        </StyledText>
        <Stack horizontal alignItems="center" gap={5}>
          <Icon
            name="clock"
            size={11}
            color={selected ? COLORS.primary : COLORS.textMuted}
          />
          <StyledText fontSize={12.5} color={COLORS.textMuted}>
            {slot.windowStart}–{slot.windowEnd}
          </StyledText>
        </Stack>
        <Stack horizontal alignItems="center" gap={5}>
          <Stack
            width={6}
            height={6}
            borderRadius={3}
            backgroundColor={availabilityColor}
          />
          <StyledText fontSize={11} fontWeight="700" color={availabilityColor}>
            {disabled
              ? "Full"
              : slot.status === "limited"
                ? "Almost full"
                : "Available"}
          </StyledText>
        </Stack>
      </Stack>
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
      marginBottom={8}
      style={[SHADOW_CARD, { elevation: 1.5 }]}
    >
      {item.imageUrl ? (
        <Stack style={{ width: 84 }}>
          <StyledImage
            source={{ uri: item.imageUrl }}
            height={84}
            borderRadius={18}
          />
        </Stack>
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

      <Stack marginHorizontal={8} flex={1} gap={4}>
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
          <StyledText
            fontSize={13}
            color={COLORS.textMuted}
            numberOfLines={2}
            lineHeight={18}
          >
            {item.description}
          </StyledText>
        )}
        <StyledText
          fontSize={16}
          fontWeight="800"
          color={COLORS.primary}
          style={{ marginTop: 2 }}
        >
          {formatMoney(item.priceCents)}
        </StyledText>
      </Stack>

      <ScalePressable
        onPress={onPress}
        disabled={!item.isAvailable}
        toValue={0.88}
      >
        {item.isAvailable ? (
          <StyledShape
            cycle
            size={48}
            backgroundColor={COLORS.bgCard}
            borderWidth={1}
            borderColor={theme.colors.gray[300]}
            style={SHADOW_CTA}
          >
            <Icon name="plus" size={20} color={theme.colors.gray[800]} />
          </StyledShape>
        ) : (
          <StyledShape cycle size={48} backgroundColor={COLORS.bgMuted}>
            <Icon name="plus" size={20} color={COLORS.textMuted} />
          </StyledShape>
        )}
      </ScalePressable>
    </Stack>
  );
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const cart = useCart();
  const { user } = useAuth();
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [saved, setSaved] = useState(false);
  const slotsScrollRef = useRef<ScrollView>(null);

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
    if (
      cart.restaurantId &&
      cart.restaurantId !== restaurant.id &&
      cart.lines.length > 0
    ) {
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
      <StyledPage
        flex={1}
        backgroundColor={COLORS.bg}
        alignItems="center"
        justifyContent="center"
      >
        <Loader variant="spinner" color={COLORS.primary} />
      </StyledPage>
    );
  }

  const notAccepting = getNotAcceptingOrdersError(error);
  if (notAccepting) {
    return (
      <StyledPage
        flex={1}
        backgroundColor={COLORS.bg}
        alignItems="center"
        justifyContent="center"
        padding={32}
      >
        <Stack alignItems="center" gap={14}>
          <StyledShape size={88} cycle backgroundColor={COLORS.primaryLight}>
            <Icon name="clock" size={34} color={COLORS.primary} />
          </StyledShape>
          <StyledText
            fontSize={17}
            fontWeight="800"
            color={COLORS.textPrimary}
            textAlign="center"
          >
            Not taking orders right now
          </StyledText>
          <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
            {notAccepting.restaurantName} has paused new orders for the
            moment. Check back later.
          </StyledText>
          <ScalePressable onPress={() => router.back()} toValue={0.96}>
            <Stack
              backgroundColor={COLORS.primary}
              borderRadius={999}
              paddingHorizontal={24}
              paddingVertical={14}
              marginTop={8}
              style={SHADOW_CTA}
            >
              <StyledText fontSize={14.5} fontWeight="700" color={COLORS.white}>
                Back to restaurants
              </StyledText>
            </Stack>
          </ScalePressable>
        </Stack>
      </StyledPage>
    );
  }

  if (error || !restaurant) {
    return (
      <StyledPage
        flex={1}
        backgroundColor={COLORS.bg}
        alignItems="center"
        justifyContent="center"
        padding={24}
      >
        <StyledText fontSize={15} color={COLORS.error} textAlign="center">
          Could not load this restaurant.
        </StyledText>
      </StyledPage>
    );
  }

  return (
    <StyledPage showStatusBar={true} backgroundColor={theme.colors.gray[100]}>
      <StyledPage.Header.Full>
        <StyledImageBackground
          source={{
            uri:
              restaurant.imageUrl ||
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          }}
          height={HERO_HEIGHT}
          borderRadius={24}
          overflow="hidden"
          borderBottomLeftRadius={32}
          borderBottomRightRadius={32}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Legibility gradient for the floating controls + avatar */}
          <Svg
            style={[
              StyleSheet.absoluteFill,
              { top: undefined, height: 150, bottom: 0 },
            ]}
          >
            <Defs>
              <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0C0A09" stopOpacity={0} />
                <Stop offset="1" stopColor="#0C0A09" stopOpacity={0.55} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#hero-fade)" />
          </Svg>

          <Stack
            top={16}
            marginHorizontal={16}
            horizontal
            alignItems="center"
            justifyContent="space-between"
          >
            <CircleIconButton icon="arrow-left" onPress={() => router.back()} />
            <Stack horizontal gap={12} alignItems="center">
              <CircleIconButton icon="share-2" onPress={handleShare} />
              <CircleIconButton
                icon="heart"
                active={saved}
                onPress={() => setSaved((s) => !s)}
              />
            </Stack>
          </Stack>
        </StyledImageBackground>
      </StyledPage.Header.Full>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Stack
          alignItems="center"
          paddingHorizontal={24}
          paddingTop={24}
          paddingBottom={6}
          gap={10}
        >
          <StyledText
            fontSize={28}
            fontWeight="800"
            color={COLORS.textPrimary}
            textAlign="center"
            style={{ letterSpacing: -0.4 }}
          >
            {restaurant.name}
          </StyledText>

          <Stack
            horizontal
            alignItems="center"
            gap={8}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Stack horizontal alignItems="center" gap={5}>
              <StyledText fontSize={14}>
                {cuisineEmoji(restaurant.cuisine)}
              </StyledText>
              <StyledText fontSize={15} color={COLORS.textMuted}>
                {restaurant.cuisine}
              </StyledText>
            </Stack>
            <StyledText fontSize={13} color={COLORS.border}>
              ·
            </StyledText>
            {restaurant.averageRating !== null ? (
              <Stack horizontal alignItems="center" gap={4}>
                <Icon name="star" size={14} color="#F59E0B" />
                <StyledText
                  fontSize={15}
                  fontWeight="700"
                  color={COLORS.textPrimary}
                >
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
            <Stack horizontal alignItems="center" gap={5}>
              <Icon name="tag" size={13} color={COLORS.textMuted} />
              <StyledText fontSize={15} color={COLORS.textMuted}>
                Min {formatMoney(restaurant.minOrderCents)}
              </StyledText>
            </Stack>
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

        {/* ── Delivery slots ────────────────────────────────────────── */}
        <Stack gap={12} paddingTop={18} paddingBottom={8}>
          <Stack horizontal alignItems="center" gap={8} paddingHorizontal={24}>
            <Icon name="calendar" size={18} color={COLORS.primary} />
            <StyledText
              fontSize={20}
              fontWeight="700"
              color={COLORS.textPrimary}
              style={{ letterSpacing: -0.2 }}
            >
              Delivery slots
            </StyledText>
          </Stack>
          <ScrollView
            ref={slotsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            {restaurant.deliverySlots.map((slot) => (
              <SlotChip
                key={slot.id}
                slot={slot}
                selected={cart.selectedSlot?.id === slot.id}
                onPress={() => handleSlotSelect(slot)}
              />
            ))}
            {restaurant.deliverySlots.length > 2 && (
              <ScalePressable
                onPress={() => slotsScrollRef.current?.scrollToEnd()}
                toValue={0.88}
              >
                <Stack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={theme.colors.gray[1]}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    ...SHADOW_SOFT,
                  }}
                >
                  <Icon name="chevron-right" size={18} color={COLORS.primary} />
                </Stack>
              </ScalePressable>
            )}
          </ScrollView>
          {cart.selectedSlot && (
            <StyledText
              fontSize={12.5}
              color={COLORS.textMuted}
              paddingHorizontal={24}
            >
              Delivery slot selected — you can change it at checkout too.
            </StyledText>
          )}
        </Stack>

        {/* ── Menu ──────────────────────────────────────────────────── */}
        <Stack paddingHorizontal={24} paddingTop={20} gap={4}>
          <Stack horizontal alignItems="center" gap={8} marginBottom={14}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={18}
              color={COLORS.primary}
            />
            <StyledText
              fontSize={20}
              fontWeight="700"
              color={COLORS.textPrimary}
              style={{ letterSpacing: -0.2 }}
            >
              Menu
            </StyledText>
          </Stack>
          {restaurant.menuItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onPress={() => handleQuickAdd(item)}
            />
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
