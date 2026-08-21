import { useState, type ReactNode } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { Feather as Icon, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  StyledPage,
  Stack,
  StyledPressable,
  StyledTextInput,
  StyledShape,
  Popup,
  toastService,
  Spinner,
} from "fluent-styles";
import { Text } from "../../src/components/text";
import { useCart } from "../../src/cart/CartContext";
import { ESTIMATED_DELIVERY_FEE_CENTS } from "../../src/cart/cart-utils";
import { useAddresses } from "../../src/hooks/useAddresses";
import { useRestaurant } from "../../src/hooks/useRestaurants";
import { useValidatePromoCode, useCreateSetupIntent } from "../../src/hooks/useCheckout";
import { useCreateOrder } from "../../src/hooks/useOrders";
import { formatMoney, formatDate } from "../../src/lib/format";
import { cuisineEmoji } from "../../src/lib/cuisines";
import { apiErrorMessage } from "../../src/api/client";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD, SHADOW_CTA } from "../../src/lib/animations";
import type { Address, DeliverySlot } from "../../src/api/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CheckoutScreen() {
  const cart = useCart();
  const { initPaymentSheet, presentPaymentSheet, retrieveSetupIntent } = useStripe();
  const insets = useSafeAreaInsets();
  // Caps how tall a Popup's scrollable body can grow — keeps its title +
  // close button from ever being pushed up under the status bar / Dynamic
  // Island on tall lists (many saved addresses, many delivery slots).
  const popupMaxHeight = SCREEN_HEIGHT - insets.top - insets.bottom - 200;

  const { data: addresses } = useAddresses();
  const { data: restaurant } = useRestaurant(cart.restaurantId ?? undefined);
  const createSetupIntent = useCreateSetupIntent();
  const createOrder = useCreateOrder();
  const validatePromo = useValidatePromoCode();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discountCents: number; description: string | null } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cardsAnim = useFadeUp(0);
  const summaryAnim = useFadeUp(100);

  // Default to the account's default address the first time addresses load.
  // (React's documented "adjust state during render" pattern — the guard
  // condition makes it fire exactly once, not an infinite loop.)
  if (!selectedAddress && addresses && addresses.length > 0) {
    setSelectedAddress(addresses.find((a) => a.isDefault) ?? addresses[0]);
  }

  const deliveryFeeCents = ESTIMATED_DELIVERY_FEE_CENTS;
  const discountCents = promo?.discountCents ?? 0;
  const estimatedTotalCents = Math.max(0, cart.subtotalCents + deliveryFeeCents - discountCents);

  const belowMinimum =
    restaurant != null && cart.subtotalCents < restaurant.minOrderCents
      ? restaurant.minOrderCents - cart.subtotalCents
      : 0;

  const canPay =
    cart.lines.length > 0 &&
    !!selectedAddress &&
    !!cart.selectedSlot &&
    !!cart.restaurantId &&
    !submitting;

  async function handleApplyPromo() {
    if (!promoInput.trim() || !cart.restaurantId) return;
    try {
      const result = await validatePromo.mutateAsync({
        code: promoInput.trim(),
        restaurantId: cart.restaurantId,
        subtotalCents: cart.subtotalCents,
      });
      setPromo({ code: promoInput.trim(), discountCents: result.discountCents, description: result.description });
      toastService.success("Promo applied", result.description ?? undefined);
    } catch (err) {
      toastService.error("Couldn't apply that code", apiErrorMessage(err));
    }
  }

  async function handlePay() {
    if (!canPay || !cart.restaurantId || !selectedAddress || !cart.selectedSlot) return;

    setSubmitting(true);
    try {
      setStatusMessage("Starting checkout…");
      const { clientSecret } = await createSetupIntent.mutateAsync();

      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: "Pre-Meal",
      });
      if (initError) {
        toastService.error("Could not start payment", initError.message);
        return;
      }

      setStatusMessage("Waiting for card details…");
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        // Includes a plain cancel — not an error worth surfacing as one.
        if (presentError.code !== "Canceled") {
          toastService.error("Card entry failed", presentError.message);
        }
        return;
      }

      setStatusMessage("Confirming card…");
      const { setupIntent, error: retrieveError } = await retrieveSetupIntent(clientSecret);
      if (retrieveError || !setupIntent?.paymentMethodId) {
        toastService.error("Could not confirm your card", retrieveError?.message);
        return;
      }

      setStatusMessage("Placing your order…");
      const order = await createOrder.mutateAsync({
        restaurantId: cart.restaurantId,
        slotId: cart.selectedSlot.id,
        deliveryAddress: selectedAddress.address,
        stripePaymentMethodId: setupIntent.paymentMethodId,
        promoCode: promo?.code,
        notes: notes.trim() || undefined,
        items: cart.lines.map((l) => ({
          menuItemId: l.menuItem.id,
          quantity: l.quantity,
          selectedOptionIds: l.selectedOptionIds,
        })),
      });

      cart.clearCart();
      // replace() alone only swaps the top of the stack — basket, restaurant
      // detail, and results would still be sitting underneath, so "back"
      // from the confirmation could surface an already-submitted, now-stale
      // basket. Clear the stack back to Discover first, then rebuild it as
      // [Discover, Orders, OrderDetail] — back goes to Order History (the
      // more relevant destination right after placing an order), back again
      // goes to Home.
      router.dismissAll();
      router.push("/orders");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toastService.error("Could not place your order", apiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setStatusMessage(null);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
        <CheckoutHeader restaurantName={null} restaurantCuisine={null} restaurantId={null} />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32}>
          <Text fontSize={15} color={COLORS.textMuted} textAlign="center">
            Your basket is empty — add something first.
          </Text>
        </Stack>
      </StyledPage>
    );
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <CheckoutHeader
        restaurantName={cart.restaurantName}
        restaurantCuisine={restaurant?.cuisine ?? null}
        restaurantId={cart.restaurantId}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={cardsAnim}>
          <Stack gap={16}>
            {/* ── Delivery address ────────────────────────────────────── */}
            <SectionCard
              icon="map-pin"
              complete={!!selectedAddress}
              onPress={() => setAddressPickerOpen(true)}
            >
              {selectedAddress ? (
                <>
                  <Text fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
                    {selectedAddress.label ?? "Address"}
                  </Text>
                  <Text fontSize={13} color={COLORS.textMuted} numberOfLines={1}>
                    {selectedAddress.address}
                  </Text>
                </>
              ) : (
                <>
                  <Text fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
                    Delivery address
                  </Text>
                  <Text fontSize={13} color={COLORS.error}>
                    No saved address — tap to add one
                  </Text>
                </>
              )}
            </SectionCard>

            {/* ── Delivery slot — the actual "not ASAP" differentiator ─── */}
            <SectionCard
              icon="clock"
              complete={!!cart.selectedSlot}
              onPress={() => setSlotPickerOpen(true)}
            >
              {cart.selectedSlot ? (
                <>
                  <Text fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
                    {formatDate(cart.selectedSlot.date)}
                  </Text>
                  <Text fontSize={13} color={COLORS.textMuted}>
                    {cart.selectedSlot.windowStart}–{cart.selectedSlot.windowEnd}
                  </Text>
                </>
              ) : (
                <>
                  <Text fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
                    Delivery time
                  </Text>
                  <Text fontSize={13} color={COLORS.error}>
                    Choose a delivery slot
                  </Text>
                </>
              )}
            </SectionCard>

            {/* ── Notes ───────────────────────────────────────────────── */}
            <Stack gap={8}>
              <Text
                fontSize={13}
                fontWeight="700"
                color={COLORS.textMuted}
                style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Order notes (optional)
              </Text>
              <StyledTextInput
                variant="outline"
                size="lg"
                placeholder="e.g. leave with reception, ring the bell…"
                value={notes}
                onChangeText={setNotes}
                multiline
                focusColor={COLORS.primary}
                rightIcon={<Icon name="edit-2" size={16} color={COLORS.textMuted} />}
              />
            </Stack>

            {/* ── Voucher ─────────────────────────────────────────────── */}
            <Stack gap={8}>
              <Text
                fontSize={13}
                fontWeight="700"
                color={COLORS.textMuted}
                style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Voucher
              </Text>

              {promo ? (
                <Stack
                  horizontal
                  alignItems="center"
                  justifyContent="space-between"
                  padding={16}
                  borderRadius={20}
                  backgroundColor={COLORS.primaryLight}
                  style={SHADOW_SOFT}
                >
                  <Stack horizontal alignItems="center" gap={10} flex={1}>
                    <StyledShape size={32} cycle backgroundColor="#FFFFFF">
                      <Icon name="check" size={15} color={COLORS.primary} />
                    </StyledShape>
                    <Text fontSize={13.5} fontWeight="700" color={COLORS.primary} style={{ flexShrink: 1 }}>
                      {promo.code} applied — {formatMoney(promo.discountCents)} off
                    </Text>
                  </Stack>
                  <StyledPressable
                    onPress={() => {
                      setPromo(null);
                      setPromoInput("");
                    }}
                  >
                    <Text fontSize={13} fontWeight="600" color={COLORS.textMuted}>
                      Remove
                    </Text>
                  </StyledPressable>
                </Stack>
              ) : (
                <Stack
                  horizontal
                  alignItems="center"
                  gap={10}
                  padding={10}
                  borderRadius={22}
                  backgroundColor={COLORS.bgCard}
                  style={[SHADOW_CARD, { elevation: 1.5 }]}
                >
                  <Stack flex={1}>
                    <StyledTextInput
                      variant="ghost"
                      placeholder="Enter voucher code"
                      value={promoInput}
                      onChangeText={setPromoInput}
                      autoCapitalize="characters"
                      focusColor={COLORS.primary}
                      leftIcon={
                        <MaterialCommunityIcons
                          name="ticket-percent-outline"
                          size={18}
                          color={COLORS.textMuted}
                        />
                      }
                    />
                  </Stack>
                  <ScalePressable
                    onPress={handleApplyPromo}
                    disabled={!promoInput.trim() || validatePromo.isPending}
                    toValue={0.94}
                  >
                    <Stack
                      paddingHorizontal={20}
                      paddingVertical={12}
                      alignItems="center"
                      justifyContent="center"
                      borderRadius={16}
                      backgroundColor={promoInput.trim() ? COLORS.primary : COLORS.bgMuted}
                      style={promoInput.trim() ? SHADOW_CTA : undefined}
                    >
                      {validatePromo.isPending ? (
                        <Spinner size={18} color={COLORS.white} />
                      ) : (
                        <Text
                          variant="button"
                          color={promoInput.trim() ? COLORS.white : COLORS.textMuted}
                        >
                          Apply
                        </Text>
                      )}
                    </Stack>
                  </ScalePressable>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Animated.View>

        {/* ── Price breakdown ─────────────────────────────────────── */}
        <Animated.View style={summaryAnim}>
          <Stack gap={14} padding={20} borderRadius={26} backgroundColor={COLORS.bgCard} marginTop={16} style={[SHADOW_CARD, { elevation: 1.5 }]}>
            <Text fontSize={16} fontWeight="800" color={COLORS.textPrimary}>
              Order summary
            </Text>
            <SummaryRow icon="shopping-bag" label="Subtotal" value={formatMoney(cart.subtotalCents)} />
            <SummaryRow icon="truck" label="Delivery fee (est.)" value={formatMoney(deliveryFeeCents)} />
            {discountCents > 0 && (
              <SummaryRow icon="tag" label="Discount" value={`-${formatMoney(discountCents)}`} valueColor={COLORS.success} />
            )}
            <Stack borderTopWidth={1} borderTopColor={COLORS.border} paddingTop={12}>
              <SummaryRow label="Estimated total" value={formatMoney(estimatedTotalCents)} bold />
            </Stack>
            {belowMinimum > 0 && (
              <Text variant="bodySmall" color={COLORS.warning}>
                Add {formatMoney(belowMinimum)} more to meet this restaurant's minimum order.
              </Text>
            )}
          </Stack>
        </Animated.View>
      </ScrollView>

      {/* ── Floating payment panel ───────────────────────────────────── */}
      <Stack paddingHorizontal={16} paddingTop={4} paddingBottom={Math.max(insets.bottom, 16)}>
        <Stack backgroundColor={COLORS.bgCard} borderRadius={28} padding={20} gap={14} style={[SHADOW_CARD, { elevation: 1.5 }]}>
          {statusMessage && (
            <Text fontSize={13} color={COLORS.textMuted} textAlign="center">
              {statusMessage}
            </Text>
          )}

          <Stack horizontal alignItems="center" justifyContent="space-between" gap={14}>
            <Stack gap={2}>
              <Text variant="bodySmall" color={COLORS.textMuted}>
                Total to pay
              </Text>
              <Text fontSize={24} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.4 }}>
                {formatMoney(estimatedTotalCents)}
              </Text>
            </Stack>

            <ScalePressable onPress={handlePay} disabled={!canPay} toValue={0.96}>
              <Stack
                borderRadius={999}
                overflow="hidden"
                paddingHorizontal={26}
                paddingVertical={17}
                alignItems="center"
                justifyContent="center"
                backgroundColor={canPay ? undefined : COLORS.bgMuted}
                style={canPay ? SHADOW_CTA : undefined}
              >
                {canPay && (
                  <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Defs>
                      <LinearGradient id="pay-cta" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                        <Stop offset="1" stopColor={COLORS.primaryDark} stopOpacity={1} />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#pay-cta)" />
                  </Svg>
                )}
                {submitting ? (
                  <Spinner size={18} color={canPay ? COLORS.white : COLORS.textMuted} />
                ) : (
                  <Stack horizontal alignItems="center" gap={7}>
                    <Text fontSize={16} fontWeight="700" color={canPay ? COLORS.white : COLORS.textMuted}>
                      Pay {formatMoney(estimatedTotalCents)}
                    </Text>
                    <Icon name="arrow-right" size={16} color={canPay ? COLORS.white : COLORS.textMuted} />
                  </Stack>
                )}
              </Stack>
            </ScalePressable>
          </Stack>

          <Stack horizontal alignItems="center" justifyContent="center" gap={16}>
            <Stack horizontal alignItems="center" gap={5}>
              <Icon name="shield" size={12} color={COLORS.textMuted} />
              <Text fontSize={11.5} color={COLORS.textMuted}>
                Secure checkout
              </Text>
            </Stack>
            <Stack horizontal alignItems="center" gap={5}>
              <Icon name="lock" size={12} color={COLORS.textMuted} />
              <Text fontSize={11.5} color={COLORS.textMuted}>
                Encrypted and safe payments
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Address picker ───────────────────────────────────────────── */}
      {/* Content is height-capped below the status bar / Dynamic Island so
          the Popup's own title+close header never has to grow past the top
          safe area — the row list scrolls inside that fixed budget instead. */}
      <Popup visible={addressPickerOpen} onClose={() => setAddressPickerOpen(false)} title="Choose an address" showClose>
        <Stack paddingTop={20} paddingHorizontal={20} gap={12} style={{ maxHeight: popupMaxHeight }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {(addresses ?? []).map((addr) => {
              const selected = selectedAddress?.id === addr.id;
              return (
                <ScalePressable
                  key={addr.id}
                  toValue={0.98}
                  onPress={() => {
                    setSelectedAddress(addr);
                    setAddressPickerOpen(false);
                  }}
                >
                  <Stack
                    horizontal
                    alignItems="center"
                    gap={12}
                    padding={16}
                    borderRadius={20}
                    borderWidth={selected ? 2 : 0}
                    borderColor={COLORS.primary}
                    backgroundColor={selected ? COLORS.primaryLight : COLORS.bgCard}
                    style={SHADOW_SOFT}
                  >
                    <StyledShape size={40} cycle backgroundColor={selected ? "#FFFFFF" : COLORS.bgMuted}>
                      <Icon name="map-pin" size={17} color={COLORS.primary} />
                    </StyledShape>
                    <Stack flex={1} gap={2}>
                      <Text fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                        {addr.label ?? "Address"} {addr.isDefault ? "· Default" : ""}
                      </Text>
                      <Text fontSize={13} color={COLORS.textMuted} numberOfLines={1}>
                        {addr.address}
                      </Text>
                    </Stack>
                    {selected && <Icon name="check-circle" size={20} color={COLORS.primary} />}
                  </Stack>
                </ScalePressable>
              );
            })}
          </ScrollView>

          {/* Stays put below the scrolling list rather than scrolling away with it. */}
          <ScalePressable
            toValue={0.98}
            onPress={() => {
              setAddressPickerOpen(false);
              router.push("/addresses");
            }}
          >
            <Stack padding={14} alignItems="center">
              <Text variant="button" color={COLORS.primary}>
                + Add a new address
              </Text>
            </Stack>
          </ScalePressable>
        </Stack>
      </Popup>

      {/* ── Slot picker ───────────────────────────────────────────────── */}
      <Popup visible={slotPickerOpen} onClose={() => setSlotPickerOpen(false)} title="Choose a delivery slot" showClose>
        <Stack paddingTop={20} paddingHorizontal={20} style={{ maxHeight: popupMaxHeight }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {(restaurant?.deliverySlots ?? []).map((slot: DeliverySlot) => {
              const disabled = slot.status === "full";
              const selected = cart.selectedSlot?.id === slot.id;
              return (
                <ScalePressable
                  key={slot.id}
                  toValue={0.98}
                  disabled={disabled}
                  onPress={() => {
                    if (!disabled) {
                      cart.setSelectedSlot(slot);
                      setSlotPickerOpen(false);
                    }
                  }}
                >
                  <Stack
                    horizontal
                    alignItems="center"
                    gap={12}
                    padding={16}
                    borderRadius={20}
                    borderWidth={selected ? 2 : 0}
                    borderColor={COLORS.primary}
                    backgroundColor={selected ? COLORS.primaryLight : COLORS.bgCard}
                    style={[SHADOW_SOFT, { opacity: disabled ? 0.45 : 1 }]}
                  >
                    <StyledShape size={40} cycle backgroundColor={selected ? "#FFFFFF" : COLORS.bgMuted}>
                      <Icon name="clock" size={17} color={COLORS.primary} />
                    </StyledShape>
                    <Stack flex={1} gap={2}>
                      <Text fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                        {formatDate(slot.date)} · {slot.windowStart}–{slot.windowEnd}
                      </Text>
                      <Text variant="bodySmall" color={disabled ? COLORS.error : COLORS.textMuted}>
                        {disabled ? "Full" : slot.status === "limited" ? "Almost full" : "Available"}
                      </Text>
                    </Stack>
                    {selected && <Icon name="check-circle" size={20} color={COLORS.primary} />}
                  </Stack>
                </ScalePressable>
              );
            })}
          </ScrollView>
        </Stack>
      </Popup>
    </StyledPage>
  );
}

// ─── Header — back button, centered title, restaurant pill ────────────────────
function CheckoutHeader({
  restaurantName,
  restaurantCuisine,
  restaurantId,
}: {
  restaurantName: string | null;
  restaurantCuisine: string | null;
  restaurantId: string | null;
}) {
  return (
    <StyledPage.Header.Full>
      <Stack paddingHorizontal={20} paddingTop={8} gap={10}>
        <Stack horizontal alignItems="center" justifyContent="space-between">
          <ScalePressable onPress={() => router.back()} toValue={0.88}>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor="#FFFFFF"
              style={SHADOW_SOFT}
            >
              <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
            </Stack>
          </ScalePressable>
          <Text fontSize={18} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.2 }}>
            Checkout
          </Text>
          {/* Balances the back button so the title stays centered. */}
          <Stack width={40} height={40} />
        </Stack>

        {restaurantName && (
          <ScalePressable
            onPress={() => restaurantId && router.push(`/restaurant/${restaurantId}`)}
            toValue={0.97}
            style={{ alignSelf: "center" }}
          >
            <Stack horizontal alignItems="center" gap={6}>
              <Text variant="body">{cuisineEmoji(restaurantCuisine ?? "")}</Text>
              <Text fontSize={14.5} fontWeight="700" color={COLORS.textSecondary}>
                {restaurantName}
              </Text>
              <Icon name="chevron-right" size={14} color={COLORS.textMuted} />
            </Stack>
          </ScalePressable>
        )}
      </Stack>
    </StyledPage.Header.Full>
  );
}

// ─── Selectable info card — address / delivery time ────────────────────────────
function SectionCard({
  icon,
  complete,
  onPress,
  children,
}: {
  icon: string;
  complete: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <ScalePressable onPress={onPress} toValue={0.98}>
      <Stack
        horizontal
        alignItems="center"
        gap={14}
        backgroundColor={COLORS.bgCard}
        borderRadius={26}
        padding={18}
        style={[SHADOW_CARD, { elevation: 1.5 }]}
      >
        <View style={{ position: "relative" }}>
          <StyledShape size={52} cycle backgroundColor={COLORS.primaryLight}>
            <Icon name={icon as any} size={22} color={COLORS.primary} />
          </StyledShape>
          {complete && (
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: COLORS.success,
                borderWidth: 2,
                borderColor: COLORS.bgCard,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="check" size={9} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Stack flex={1} gap={3}>
          {children}
        </Stack>
        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
      </Stack>
    </ScalePressable>
  );
}

// ─── Order summary row — icons used sparingly, only on the line items ─────────
function SummaryRow({
  icon,
  label,
  value,
  bold,
  valueColor,
}: {
  icon?: string;
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <Stack horizontal alignItems="center" justifyContent="space-between">
      <Stack horizontal alignItems="center" gap={8}>
        {icon && <Icon name={icon as any} size={14} color={COLORS.primary} />}
        <Text fontSize={bold ? 15.5 : 14} fontWeight={bold ? "800" : "400"} color={COLORS.textSecondary}>
          {label}
        </Text>
      </Stack>
      <Text
        fontSize={bold ? 19 : 14}
        fontWeight={bold ? "800" : "700"}
        color={valueColor ?? (bold ? COLORS.primary : COLORS.textPrimary)}
      >
        {value}
      </Text>
    </Stack>
  );
}
