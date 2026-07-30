import { useEffect, useRef } from "react";
import { Animated, LayoutAnimation, Platform, ScrollView, UIManager } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  StyledPage,
  Stack,
  StyledText,
  StyledPressable,
  StyledShape,
  StyledImage,
  dialogueService,
  theme,
} from "fluent-styles";
import { useCart, type CartLine } from "../../src/cart/CartContext";
import { ESTIMATED_DELIVERY_FEE_CENTS, summarizeSelection } from "../../src/cart/cart-utils";
import { useRestaurant } from "../../src/hooks/useRestaurants";
import { formatMoney, formatDate } from "../../src/lib/format";
import { cuisineEmoji } from "../../src/lib/cuisines";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD, SHADOW_CTA } from "../../src/lib/animations";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function animateReflow() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

// ─── Small bordered circular icon button — quantity +/-, matches the "+"
// button style already established on the restaurant menu screen. ────────────
function CircleGlyphButton({
  glyph,
  onPress,
  disabled,
}: {
  glyph: "minus" | "plus";
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <ScalePressable onPress={onPress} disabled={disabled} toValue={0.85}>
      <StyledShape
        cycle
        size={34}
        borderWidth={1}
        borderColor={theme.colors.gray[300]}
        backgroundColor={disabled ? COLORS.bgMuted : "#FFFFFF"}
        style={{ opacity: disabled ? 0.4 : 1 }}
      >
        <Icon name={glyph} size={15} color={theme.colors.gray[800]} />
      </StyledShape>
    </ScalePressable>
  );
}

// ─── Basket line card ──────────────────────────────────────────────────────────
function BasketLineCard({
  line,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  line: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const qtyAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(qtyAnim, { toValue: 1.3, duration: 90, useNativeDriver: true }),
      Animated.spring(qtyAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [line.quantity, qtyAnim]);

  const modifiers = summarizeSelection(line.menuItem, line.selectedOptionIds);

  return (
    <Stack
      horizontal
      gap={14}
      backgroundColor={COLORS.bgCard}
      borderRadius={26}
      padding={16}
      marginBottom={16}
      style={SHADOW_CARD}
    >
      {line.menuItem.imageUrl ? (
        <Stack style={{ width: 88 }}>
          <StyledImage source={{ uri: line.menuItem.imageUrl }} height={88} borderRadius={20} />
        </Stack>
      ) : (
        <Stack
          width={88}
          height={88}
          borderRadius={20}
          backgroundColor={COLORS.primaryLight}
          alignItems="center"
          justifyContent="center"
        >
          <StyledText fontSize={30}>🍽️</StyledText>
        </Stack>
      )}

      <Stack flex={1} gap={6}>
        <Stack horizontal alignItems="flex-start" justifyContent="space-between" gap={8}>
          <StyledText
            fontSize={16}
            fontWeight="800"
            color={COLORS.textPrimary}
            style={{ letterSpacing: -0.2, flexShrink: 1 }}
            numberOfLines={2}
          >
            {line.menuItem.name}
          </StyledText>
          <ScalePressable onPress={onRemove} toValue={0.85}>
            <Stack
              width={28}
              height={28}
              borderRadius={14}
              alignItems="center"
              justifyContent="center"
              backgroundColor={COLORS.bgMuted}
            >
              <Icon name="trash-2" size={13} color={COLORS.textMuted} />
            </Stack>
          </ScalePressable>
        </Stack>

        {modifiers.length > 0 && (
          <StyledText fontSize={12.5} color={COLORS.textMuted} numberOfLines={2}>
            {modifiers}
          </StyledText>
        )}

        <Stack horizontal alignItems="center" justifyContent="space-between" marginTop={4}>
          <StyledText fontSize={16} fontWeight="800" color={COLORS.primary}>
            {formatMoney(line.unitPriceCents * line.quantity)}
          </StyledText>

          <Stack horizontal alignItems="center" gap={12}>
            <CircleGlyphButton glyph="minus" onPress={onDecrement} />
            <Animated.View style={{ transform: [{ scale: qtyAnim }] }}>
              <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary} style={{ minWidth: 18, textAlign: "center" }}>
                {line.quantity}
              </StyledText>
            </Animated.View>
            <CircleGlyphButton glyph="plus" onPress={onIncrement} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

// ─── Order summary row ──────────────────────────────────────────────────────────
function SummaryRow({
  icon,
  label,
  value,
  bold,
}: {
  icon: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Stack horizontal alignItems="center" justifyContent="space-between">
      <Stack horizontal alignItems="center" gap={8}>
        <Icon name={icon as any} size={14} color={bold ? COLORS.textPrimary : COLORS.primary} />
        <StyledText fontSize={bold ? 15 : 14} fontWeight={bold ? "800" : "400"} color={bold ? COLORS.textPrimary : COLORS.textSecondary}>
          {label}
        </StyledText>
      </Stack>
      <StyledText fontSize={bold ? 17 : 14} fontWeight={bold ? "800" : "700"} color={bold ? COLORS.primary : COLORS.textPrimary}>
        {value}
      </StyledText>
    </Stack>
  );
}

export default function BasketScreen() {
  const cart = useCart();
  const { data: restaurant } = useRestaurant(cart.restaurantId ?? undefined);

  const listAnim = useFadeUp(0);
  const summaryAnim = useFadeUp(100);

  const deliveryFeeCents = cart.lines.length > 0 ? ESTIMATED_DELIVERY_FEE_CENTS : 0;
  const estimatedTotalCents = cart.subtotalCents + deliveryFeeCents;

  async function handleClear() {
    const confirmed = await dialogueService.confirm({
      title: "Clear basket?",
      message: "This removes everything you've added so far.",
      confirmLabel: "Clear",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (confirmed) {
      animateReflow();
      cart.clearCart();
    }
  }

  function handleRemove(cartItemId: string) {
    animateReflow();
    cart.removeLine(cartItemId);
  }

  function handleQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) animateReflow();
    cart.updateQuantity(cartItemId, quantity);
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Stack paddingHorizontal={20} paddingTop={8} gap={10}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <ScalePressable onPress={() => router.back()} toValue={0.88}>
              <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
                <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
              </Stack>
            </ScalePressable>
            <StyledText fontSize={18} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.2 }}>
              Your Basket
            </StyledText>
            {/* Balances the back button so the title stays centered. */}
            <Stack width={40} height={40} />
          </Stack>

          {cart.restaurantName && (
            <ScalePressable
              onPress={() => cart.restaurantId && router.push(`/restaurant/${cart.restaurantId}`)}
              toValue={0.97}
              style={{ alignSelf: "center" }}
            >
              <Stack horizontal alignItems="center" gap={6}>
                <StyledText fontSize={14}>{cuisineEmoji(restaurant?.cuisine ?? "")}</StyledText>
                <StyledText fontSize={14.5} fontWeight="700" color={COLORS.textSecondary}>
                  {cart.restaurantName}
                </StyledText>
                <Icon name="chevron-right" size={14} color={COLORS.textMuted} />
              </Stack>
            </ScalePressable>
          )}
        </Stack>
      </StyledPage.Header.Full>

      {cart.lines.length === 0 ? (
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32} gap={14}>
          <StyledShape size={88} cycle backgroundColor={COLORS.primaryLight}>
            <Icon name="shopping-bag" size={34} color={COLORS.primary} />
          </StyledShape>
          <StyledText fontSize={17} fontWeight="800" color={COLORS.textPrimary} textAlign="center">
            Your basket is empty
          </StyledText>
          <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
            Add something from a restaurant to get started.
          </StyledText>
          <ScalePressable onPress={() => router.replace("/")} toValue={0.96}>
            <Stack backgroundColor={COLORS.primary} borderRadius={999} paddingHorizontal={24} paddingVertical={14} marginTop={8} style={SHADOW_CTA}>
              <StyledText fontSize={14.5} fontWeight="700" color={COLORS.white}>
                Browse restaurants
              </StyledText>
            </Stack>
          </ScalePressable>
        </Stack>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <Animated.View style={listAnim}>
              <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={16}>
                <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary}>
                  Items ({cart.itemCount})
                </StyledText>
                <StyledPressable onPress={handleClear}>
                  <StyledText fontSize={13} fontWeight="600" color={COLORS.error}>
                    Clear basket
                  </StyledText>
                </StyledPressable>
              </Stack>

              {cart.lines.map((line) => (
                <BasketLineCard
                  key={line.cartItemId}
                  line={line}
                  onIncrement={() => handleQuantity(line.cartItemId, line.quantity + 1)}
                  onDecrement={() => handleQuantity(line.cartItemId, line.quantity - 1)}
                  onRemove={() => handleRemove(line.cartItemId)}
                />
              ))}
            </Animated.View>

            <Animated.View style={summaryAnim}>
              <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={14} marginTop={8} style={SHADOW_CARD}>
                <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary} marginBottom={2}>
                  Order summary
                </StyledText>
                <SummaryRow icon="shopping-bag" label="Subtotal" value={formatMoney(cart.subtotalCents)} />
                <SummaryRow icon="truck" label="Delivery fee (est.)" value={formatMoney(deliveryFeeCents)} />
                <Stack borderTopWidth={1} borderTopColor={COLORS.border} paddingTop={12}>
                  <SummaryRow icon="check-circle" label="Estimated total" value={formatMoney(estimatedTotalCents)} bold />
                </Stack>
                <StyledText fontSize={11.5} color={COLORS.textMuted}>
                  Delivery fee is an estimate — the final total is confirmed at checkout.
                </StyledText>
              </Stack>
            </Animated.View>
          </ScrollView>

          {/* ── Floating checkout panel ─────────────────────────────── */}
          <Stack paddingHorizontal={16} paddingBottom={16} paddingTop={4}>
            <Stack backgroundColor={COLORS.bgCard} borderRadius={28} padding={18} gap={12} style={SHADOW_CARD}>
              <Stack horizontal alignItems="center" justifyContent="space-between">
                <Stack gap={2}>
                  <StyledText fontSize={12} color={COLORS.textMuted}>
                    Total
                  </StyledText>
                  <StyledText fontSize={22} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.4 }}>
                    {formatMoney(estimatedTotalCents)}
                  </StyledText>
                </Stack>
                {cart.selectedSlot ? (
                  <Stack alignItems="flex-end" gap={2}>
                    <StyledText fontSize={12} color={COLORS.textMuted}>
                      Delivery
                    </StyledText>
                    <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
                      {formatDate(cart.selectedSlot.date)} · {cart.selectedSlot.windowStart}
                    </StyledText>
                  </Stack>
                ) : (
                  <StyledText fontSize={12} color={COLORS.textMuted} style={{ maxWidth: "45%" }} textAlign="right">
                    Delivery time chosen at checkout
                  </StyledText>
                )}
              </Stack>

              <ScalePressable onPress={() => router.push("/checkout")} toValue={0.97}>
                <Stack
                  borderRadius={999}
                  overflow="hidden"
                  paddingVertical={17}
                  alignItems="center"
                  justifyContent="center"
                  style={SHADOW_CTA}
                >
                  <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Defs>
                      <LinearGradient id="checkout-cta" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                        <Stop offset="1" stopColor={COLORS.primaryDark} stopOpacity={1} />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#checkout-cta)" />
                  </Svg>
                  <Stack horizontal alignItems="center" gap={8}>
                    <StyledText fontSize={16} fontWeight="700" color={COLORS.white}>
                      Go to checkout
                    </StyledText>
                    <Icon name="arrow-right" size={17} color={COLORS.white} />
                  </Stack>
                </Stack>
              </ScalePressable>
            </Stack>
          </Stack>
        </>
      )}
    </StyledPage>
  );
}
