import { useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import {
  StyledPage,
  Stack,
  StyledText,
  StyledPressable,
  StyledHeader,
  StyledTextInput,
  Popup,
  toastService,
} from "fluent-styles";
import { useCart } from "../../src/cart/CartContext";
import { useAddresses } from "../../src/hooks/useAddresses";
import { useRestaurant } from "../../src/hooks/useRestaurants";
import { useValidatePromoCode, useCreateSetupIntent } from "../../src/hooks/useCheckout";
import { useCreateOrder } from "../../src/hooks/useOrders";
import { formatMoney, formatDate } from "../../src/lib/format";
import { apiErrorMessage } from "../../src/api/client";
import { COLORS } from "../../src/theme/colors";
import type { Address, DeliverySlot } from "../../src/api/types";

// Flat delivery fee — mirrors DELIVERY_FEE_CENTS in premeal-app/src/lib/capacity.ts.
// Mobile has no /subscriptions endpoint to check for a fee waiver, so this
// is shown as an estimate; the order the server actually creates is the
// source of truth for the final charge.
const ESTIMATED_DELIVERY_FEE_CENTS = 300;

export default function CheckoutScreen() {
  const cart = useCart();
  const { initPaymentSheet, presentPaymentSheet, retrieveSetupIntent } = useStripe();

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
      router.replace(`/orders/${order.id}`);
    } catch (err) {
      toastService.error("Could not place your order", apiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setStatusMessage(null);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg}>
        <StyledHeader title="Checkout" titleAlignment="center" showBackArrow onBackPress={() => router.back()} backgroundColor={COLORS.bgCard} showStatusBar statusBarProps={{ barStyle: "dark-content" }} />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32}>
          <StyledText fontSize={15} color={COLORS.textMuted} textAlign="center">
            Your basket is empty — add something first.
          </StyledText>
        </Stack>
      </StyledPage>
    );
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader title="Checkout" titleAlignment="center" showBackArrow onBackPress={() => router.back()} backgroundColor={COLORS.bgCard} showStatusBar statusBarProps={{ barStyle: "dark-content" }} borderBottomWidth={0.5} borderBottomColor={COLORS.border} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Stack gap={20}>
          {/* ── Delivery address ────────────────────────────────────── */}
          <SectionCard label="Delivery address" onPress={() => setAddressPickerOpen(true)}>
            {selectedAddress ? (
              <>
                <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                  {selectedAddress.label ?? "Address"}
                </StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted}>
                  {selectedAddress.address}
                </StyledText>
              </>
            ) : (
              <StyledText fontSize={14} color={COLORS.error}>
                No saved address — tap to add one
              </StyledText>
            )}
          </SectionCard>

          {/* ── Delivery slot — the actual "not ASAP" differentiator ─── */}
          <SectionCard label="Delivery time" onPress={() => setSlotPickerOpen(true)}>
            {cart.selectedSlot ? (
              <>
                <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                  {formatDate(cart.selectedSlot.date)}
                </StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted}>
                  {cart.selectedSlot.windowStart}–{cart.selectedSlot.windowEnd}
                </StyledText>
              </>
            ) : (
              <StyledText fontSize={14} color={COLORS.error}>
                Choose a delivery slot
              </StyledText>
            )}
          </SectionCard>

          {/* ── Notes ───────────────────────────────────────────────── */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={COLORS.textMuted} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Order notes (optional)
            </StyledText>
            <StyledTextInput
              variant="outline"
              placeholder="e.g. leave with reception, ring the bell…"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </Stack>

          {/* ── Promo code ──────────────────────────────────────────── */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={COLORS.textMuted} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Voucher
            </StyledText>
            {promo ? (
              <Stack horizontal alignItems="center" justifyContent="space-between" padding={12} borderRadius={12} backgroundColor={COLORS.primaryLight}>
                <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>
                  {promo.code} applied — {formatMoney(promo.discountCents)} off
                </StyledText>
                <StyledPressable onPress={() => { setPromo(null); setPromoInput(""); }}>
                  <StyledText fontSize={13} fontWeight="600" color={COLORS.textMuted}>Remove</StyledText>
                </StyledPressable>
              </Stack>
            ) : (
              <Stack horizontal gap={10}>
                <Stack flex={1}>
                  <StyledTextInput
                    variant="outline"
                    placeholder="Enter voucher code"
                    value={promoInput}
                    onChangeText={setPromoInput}
                    autoCapitalize="characters"
                  />
                </Stack>
                <StyledPressable
                  onPress={handleApplyPromo}
                  paddingHorizontal={20}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={12}
                  backgroundColor={promoInput.trim() ? COLORS.primary : COLORS.bgMuted}
                  disabled={!promoInput.trim() || validatePromo.isPending}
                >
                  {validatePromo.isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <StyledText fontSize={14} fontWeight="700" color={promoInput.trim() ? COLORS.white : COLORS.textMuted}>
                      Apply
                    </StyledText>
                  )}
                </StyledPressable>
              </Stack>
            )}
          </Stack>

          {/* ── Price breakdown ─────────────────────────────────────── */}
          <Stack gap={10} padding={16} borderRadius={16} backgroundColor={COLORS.bgCard} borderWidth={1} borderColor={COLORS.border}>
            <Row label="Subtotal" value={formatMoney(cart.subtotalCents)} />
            <Row label="Delivery fee (est.)" value={formatMoney(deliveryFeeCents)} />
            {discountCents > 0 && <Row label="Discount" value={`-${formatMoney(discountCents)}`} valueColor={COLORS.success} />}
            <Stack borderTopWidth={1} borderTopColor={COLORS.border} paddingTop={10}>
              <Row label="Estimated total" value={formatMoney(estimatedTotalCents)} bold />
            </Stack>
            {belowMinimum > 0 && (
              <StyledText fontSize={12} color={COLORS.warning}>
                Add {formatMoney(belowMinimum)} more to meet this restaurant's minimum order.
              </StyledText>
            )}
          </Stack>
        </Stack>
      </ScrollView>

      <Stack backgroundColor={COLORS.bgCard} borderTopWidth={1} borderTopColor={COLORS.border} padding={20} gap={10}>
        {statusMessage && (
          <StyledText fontSize={13} color={COLORS.textMuted} textAlign="center">
            {statusMessage}
          </StyledText>
        )}
        <StyledPressable
          onPress={handlePay}
          disabled={!canPay}
          alignItems="center"
          justifyContent="center"
          paddingVertical={17}
          borderRadius={999}
          backgroundColor={canPay ? COLORS.primary : COLORS.bgMuted}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <StyledText fontSize={16} fontWeight="700" color={canPay ? COLORS.white : COLORS.textMuted}>
              Pay {formatMoney(estimatedTotalCents)}
            </StyledText>
          )}
        </StyledPressable>
      </Stack>

      {/* ── Address picker ───────────────────────────────────────────── */}
      <Popup visible={addressPickerOpen} onClose={() => setAddressPickerOpen(false)} title="Choose an address" showClose>
        <Stack padding={20} gap={10}>
          {(addresses ?? []).map((addr) => (
            <StyledPressable
              key={addr.id}
              onPress={() => { setSelectedAddress(addr); setAddressPickerOpen(false); }}
              padding={14}
              borderRadius={12}
              borderWidth={selectedAddress?.id === addr.id ? 2 : 1}
              borderColor={selectedAddress?.id === addr.id ? COLORS.primary : COLORS.border}
              backgroundColor={selectedAddress?.id === addr.id ? COLORS.primaryLight : COLORS.bgCard}
            >
              <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                {addr.label ?? "Address"} {addr.isDefault ? "· Default" : ""}
              </StyledText>
              <StyledText fontSize={13} color={COLORS.textMuted}>{addr.address}</StyledText>
            </StyledPressable>
          ))}
          <StyledPressable
            onPress={() => { setAddressPickerOpen(false); router.push("/addresses"); }}
            padding={14}
            alignItems="center"
          >
            <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>+ Add a new address</StyledText>
          </StyledPressable>
        </Stack>
      </Popup>

      {/* ── Slot picker ───────────────────────────────────────────────── */}
      <Popup visible={slotPickerOpen} onClose={() => setSlotPickerOpen(false)} title="Choose a delivery slot" showClose>
        <Stack padding={20} gap={10}>
          {(restaurant?.deliverySlots ?? []).map((slot: DeliverySlot) => {
            const disabled = slot.status === "full";
            const selected = cart.selectedSlot?.id === slot.id;
            return (
              <StyledPressable
                key={slot.id}
                onPress={() => { if (!disabled) { cart.setSelectedSlot(slot); setSlotPickerOpen(false); } }}
                padding={14}
                borderRadius={12}
                borderWidth={selected ? 2 : 1}
                borderColor={selected ? COLORS.primary : COLORS.border}
                backgroundColor={selected ? COLORS.primaryLight : COLORS.bgCard}
                style={{ opacity: disabled ? 0.45 : 1 }}
              >
                <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                  {formatDate(slot.date)} · {slot.windowStart}–{slot.windowEnd}
                </StyledText>
                <StyledText fontSize={12} color={disabled ? COLORS.error : COLORS.textMuted}>
                  {disabled ? "Full" : slot.status === "limited" ? "Almost full" : "Available"}
                </StyledText>
              </StyledPressable>
            );
          })}
        </Stack>
      </Popup>
    </StyledPage>
  );
}

function SectionCard({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <StyledPressable
      onPress={onPress}
      horizontal
      alignItems="center"
      justifyContent="space-between"
      padding={16}
      borderRadius={16}
      backgroundColor={COLORS.bgCard}
      borderWidth={1}
      borderColor={COLORS.border}
    >
      <Stack flex={1} gap={2}>
        <StyledText fontSize={11} fontWeight="700" color={COLORS.textMuted} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </StyledText>
        {children}
      </Stack>
      <StyledText fontSize={20} color={COLORS.textMuted}>›</StyledText>
    </StyledPressable>
  );
}

function Row({ label, value, bold, valueColor }: { label: string; value: string; bold?: boolean; valueColor?: string }) {
  return (
    <Stack horizontal justifyContent="space-between">
      <StyledText fontSize={bold ? 15 : 14} fontWeight={bold ? "800" : "400"} color={COLORS.textSecondary}>
        {label}
      </StyledText>
      <StyledText fontSize={bold ? 16 : 14} fontWeight={bold ? "800" : "700"} color={valueColor ?? COLORS.textPrimary}>
        {value}
      </StyledText>
    </Stack>
  );
}
