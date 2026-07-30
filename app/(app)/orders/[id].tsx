import { useRef, useState } from "react";
import { ActivityIndicator, Animated, Linking, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather as Icon, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  StyledPage,
  Stack,
  StyledText,
  StyledShape,
  StyledTextInput,
  StyledPressable,
  dialogueService,
  toastService,
} from "fluent-styles";
import { useOrder, useCancelOrder, useSubmitReview } from "../../../src/hooks/useOrders";
import { useRestaurant } from "../../../src/hooks/useRestaurants";
import { formatMoney, formatDate } from "../../../src/lib/format";
import { apiErrorMessage } from "../../../src/api/client";
import { COLORS } from "../../../src/theme/colors";
import { STATUS_LABEL, STATUS_COLOR } from "../../../src/lib/order-status";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD, SHADOW_CTA } from "../../../src/lib/animations";
import type { Order, OrderStatus } from "../../../src/api/types";

const QUICK_CHIPS = ["Delicious 😋", "Fast Delivery 🚀", "Fresh Food 🥗", "Great Portions 🍽️", "Friendly Service 😊", "Would Order Again ❤️"];
const REVIEW_COMMENT_MAX = 1000; // server cap — zod: z.string().max(1000) in premeal-app's review route

const CANCELLABLE = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING"];

// One place covering every order state the status card can render — icon
// and the reassurance copy shown underneath. Colour comes from the shared
// STATUS_COLOR map (src/lib/order-status.ts) so this screen and the order
// list can never disagree on what colour a given status is.
const STATUS_CONFIG: Record<OrderStatus, { icon: string; iconSet?: "feather" | "mci"; message: string }> = {
  PENDING_CONFIRMATION: {
    icon: "clock",
    message: "We'll confirm your order with the restaurant shortly.",
  },
  PAYMENT_ACTION_REQUIRED: {
    icon: "alert-circle",
    message: "We need you to complete payment to continue.",
  },
  CONFIRMED: {
    icon: "check-circle",
    message: "The restaurant has confirmed your order.",
  },
  DECLINED: {
    icon: "x-circle",
    message: "The restaurant was unable to accept this order.",
  },
  EXPIRED: {
    icon: "clock",
    message: "This order expired before it could be confirmed.",
  },
  CANCELLED: {
    icon: "slash",
    message: "This order was cancelled.",
  },
  PREPARING: {
    icon: "chef-hat",
    iconSet: "mci",
    message: "The restaurant is preparing your food.",
  },
  OUT_FOR_DELIVERY: {
    icon: "truck",
    message: "Your order is on its way.",
  },
  DELIVERED: {
    icon: "check-circle",
    message: "Delivered — enjoy your meal!",
  },
};

const ASSURANCE_ITEMS = [
  { icon: "shield", title: "Secure payment", body: "Your payment is handled by Stripe." },
  { icon: "refresh-cw", title: "Live updates", body: "This page refreshes automatically as your order progresses." },
  { icon: "info", title: "Need help?", body: "Contact the restaurant using the button above." },
];

function StatusIcon({ icon, iconSet, size, color }: { icon: string; iconSet?: "feather" | "mci"; size: number; color: string }) {
  if (iconSet === "mci") return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  return <Icon name={icon as any} size={size} color={color} />;
}

// ─── Star — filled/outline, with a small bounce when tapped ───────────────────
function StarButton({ filled, onPress, size }: { filled: boolean; onPress?: () => void; size: number }) {
  const anim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (!onPress) return;
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.35, duration: 90, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  const star = (
    <Animated.View style={{ transform: [{ scale: anim }] }}>
      <Ionicons name={filled ? "star" : "star-outline"} size={size} color={COLORS.primary} />
    </Animated.View>
  );

  if (!onPress) return star;
  return (
    <StyledPressable onPress={handlePress} padding={4}>
      {star}
    </StyledPressable>
  );
}

function StarRow({ rating, onRate, size = 28 }: { rating: number; onRate?: (n: number) => void; size?: number }) {
  return (
    <Stack horizontal gap={2}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarButton key={n} filled={n <= rating} onPress={onRate ? () => onRate(n) : undefined} size={size} />
      ))}
    </Stack>
  );
}

// ─── Review — only shown once an order is DELIVERED. Single 1-5 rating +
// optional comment, matching what premeal-app's review API actually stores
// (Review model: rating, comment — no separate food/restaurant score, no
// edit after submitting). Quick chips are a client-side composition aid,
// folded into the one free-text comment field on submit, not sent as their
// own field since the backend has nowhere to put them. ─────────────────────────
function ReviewSection({ orderId, review }: { orderId: string; review: Order["review"] }) {
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [justSubmitted, setJustSubmitted] = useState(false);

  function toggleChip(chip: string) {
    setChips((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));
  }

  async function handleSubmit() {
    if (rating === 0 || submitReview.isPending) return;
    const combined = [chips.join(", "), comment.trim()].filter(Boolean).join(" — ").slice(0, REVIEW_COMMENT_MAX);
    try {
      await submitReview.mutateAsync({ orderId, rating, comment: combined || undefined });
      setJustSubmitted(true);
    } catch (err) {
      toastService.error("Could not submit review", apiErrorMessage(err));
    }
  }

  // Already reviewed — read-only. No edit action: the backend is a one-shot
  // (see premeal-app's src/lib/reviews.ts), so there's nothing to wire up.
  if (review) {
    return (
      <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={12} style={SHADOW_CARD}>
        <Stack horizontal alignItems="center" gap={10}>
          <StyledShape size={40} cycle backgroundColor={COLORS.primaryLight}>
            <Ionicons name="star" size={17} color={COLORS.primary} />
          </StyledShape>
          <StyledText fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
            Your review
          </StyledText>
        </Stack>
        <StarRow rating={review.rating} size={20} />
        {review.comment && (
          <StyledText fontSize={13.5} color={COLORS.textSecondary} lineHeight={19}>
            {review.comment}
          </StyledText>
        )}
        <StyledText fontSize={11.5} color={COLORS.textMuted}>
          Submitted {formatDate(review.createdAt)}
        </StyledText>
      </Stack>
    );
  }

  if (justSubmitted) {
    return (
      <Stack backgroundColor={COLORS.successLight} borderRadius={26} padding={24} alignItems="center" gap={8} style={SHADOW_CARD}>
        <StyledShape size={52} cycle backgroundColor="#FFFFFF">
          <Icon name="check" size={24} color={COLORS.success} />
        </StyledShape>
        <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary} textAlign="center">
          Thank you for your review!
        </StyledText>
        <StyledText fontSize={13} color={COLORS.textMuted} textAlign="center">
          Your feedback helps other customers.
        </StyledText>
      </Stack>
    );
  }

  return (
    <Stack backgroundColor={COLORS.bgCard} borderRadius={28} padding={22} gap={18} style={SHADOW_CARD}>
      <Stack horizontal alignItems="center" gap={12}>
        <StyledShape size={44} cycle backgroundColor={COLORS.primaryLight}>
          <Ionicons name="star" size={19} color={COLORS.primary} />
        </StyledShape>
        <Stack flex={1} gap={2}>
          <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary}>
            How was your order?
          </StyledText>
          <StyledText fontSize={12.5} color={COLORS.textMuted}>
            We'd love to hear about your experience.
          </StyledText>
        </Stack>
      </Stack>

      <Stack alignItems="center">
        <StarRow rating={rating} onRate={setRating} size={34} />
      </Stack>

      <StyledTextInput
        variant="outline"
        placeholder="Tell other customers about your experience..."
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={REVIEW_COMMENT_MAX}
        showCounter
        focusColor={COLORS.primary}
      />

      <Stack gap={10}>
        <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
          What did you love?
        </StyledText>
        <Stack horizontal flexWrap="wrap" gap={8}>
          {QUICK_CHIPS.map((chip) => {
            const active = chips.includes(chip);
            return (
              <ScalePressable key={chip} onPress={() => toggleChip(chip)} toValue={0.95}>
                <Stack
                  paddingHorizontal={14}
                  paddingVertical={9}
                  borderRadius={999}
                  borderWidth={1.5}
                  borderColor={active ? COLORS.primary : COLORS.border}
                  backgroundColor={active ? COLORS.primaryLight : "#FFFFFF"}
                >
                  <StyledText fontSize={12.5} fontWeight="700" color={active ? COLORS.primary : COLORS.textSecondary}>
                    {chip}
                  </StyledText>
                </Stack>
              </ScalePressable>
            );
          })}
        </Stack>
      </Stack>

      <Stack
        alignItems="center"
        justifyContent="center"
        paddingVertical={16}
        borderRadius={18}
        borderWidth={1}
        borderColor={COLORS.border}
        style={{ borderStyle: "dashed", opacity: 0.55 }}
      >
        <Stack horizontal alignItems="center" gap={8}>
          <Icon name="camera" size={16} color={COLORS.textMuted} />
          <StyledText fontSize={13} fontWeight="600" color={COLORS.textMuted}>
            Add photos (Coming soon)
          </StyledText>
        </Stack>
      </Stack>

      <ScalePressable onPress={handleSubmit} disabled={rating === 0 || submitReview.isPending} toValue={0.97}>
        <Stack
          alignItems="center"
          justifyContent="center"
          paddingVertical={17}
          borderRadius={999}
          overflow="hidden"
          backgroundColor={rating > 0 ? undefined : COLORS.bgMuted}
          style={rating > 0 ? SHADOW_CTA : undefined}
        >
          {rating > 0 && (
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="review-cta" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                  <Stop offset="1" stopColor={COLORS.primaryDark} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#review-cta)" />
            </Svg>
          )}
          {submitReview.isPending ? (
            <ActivityIndicator color={rating > 0 ? "#FFFFFF" : COLORS.textMuted} />
          ) : (
            <StyledText fontSize={15.5} fontWeight="700" color={rating > 0 ? "#FFFFFF" : COLORS.textMuted}>
              Submit Review
            </StyledText>
          )}
        </Stack>
      </ScalePressable>
    </Stack>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);
  const { data: restaurant } = useRestaurant(order?.restaurant.id);
  const cancelOrder = useCancelOrder();

  const statusAnim = useFadeUp(0);
  const cardsAnim = useFadeUp(100);

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

  function handleCall() {
    if (!restaurant?.phone) return;
    Linking.openURL(`tel:${restaurant.phone}`);
  }

  if (isLoading) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
        <OrderHeader title="Order" subtitle={null} onCall={null} />
        <Stack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </Stack>
      </StyledPage>
    );
  }

  if (error || !order) {
    return (
      <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
        <OrderHeader title="Order" subtitle={null} onCall={null} />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={24}>
          <StyledText fontSize={14} color={COLORS.error} textAlign="center">
            Could not load this order.
          </StyledText>
        </Stack>
      </StyledPage>
    );
  }

  const status = {
    ...(STATUS_CONFIG[order.status] ?? { icon: "help-circle", message: "" }),
    color: STATUS_COLOR[order.status] ?? COLORS.textMuted,
  };

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <OrderHeader
        title={order.restaurant.name}
        subtitle={`Order #${order.id.slice(-5).toUpperCase()}`}
        onCall={restaurant?.phone ? handleCall : null}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Stack gap={16}>
          {/* ── Status card ─────────────────────────────────────────── */}
          <Animated.View style={statusAnim}>
            <Stack
              backgroundColor={`${status.color}12`}
              borderRadius={28}
              padding={20}
              gap={12}
              style={SHADOW_CARD}
            >
              <Stack horizontal alignItems="center" gap={14}>
                <StyledShape size={52} cycle backgroundColor="#FFFFFF">
                  <StatusIcon icon={status.icon} iconSet={status.iconSet} size={24} color={status.color} />
                </StyledShape>
                <Stack flex={1} gap={3}>
                  <StyledText fontSize={18} fontWeight="800" color={status.color} style={{ letterSpacing: -0.2 }}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </StyledText>
                  <Stack horizontal alignItems="center" gap={6}>
                    <Icon name="calendar" size={12} color={COLORS.textMuted} />
                    <StyledText fontSize={12.5} color={COLORS.textMuted}>
                      {formatDate(order.slot.date)} · {order.slot.windowStart}–{order.slot.windowEnd}
                    </StyledText>
                  </Stack>
                </Stack>
              </Stack>

              {status.message.length > 0 && (
                <StyledText fontSize={13.5} color={COLORS.textSecondary} lineHeight={19}>
                  {status.message}
                </StyledText>
              )}

              {order.cancelledByRestaurant && order.restaurantCancelReason && (
                <StyledText fontSize={13.5} color={COLORS.error} lineHeight={19}>
                  {order.restaurantCancelReason}
                </StyledText>
              )}
            </Stack>
          </Animated.View>

          <Animated.View style={cardsAnim}>
            <Stack gap={16}>
              {/* ── Order items ───────────────────────────────────────── */}
              <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} style={SHADOW_CARD}>
                <StyledText
                  fontSize={12.5}
                  fontWeight="700"
                  color={COLORS.textMuted}
                  marginBottom={16}
                  style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
                >
                  Order items
                </StyledText>
                <Stack gap={16}>
                  {order.items.map((item, i) => (
                    <Stack key={item.id}>
                      {i > 0 && <Stack height={1} backgroundColor={COLORS.border} marginBottom={16} />}
                      <Stack horizontal alignItems="center" gap={14}>
                        <StyledShape size={52} cycle backgroundColor={COLORS.primaryLight}>
                          <StyledText fontSize={20}>🍽️</StyledText>
                        </StyledShape>
                        <Stack flex={1} gap={2}>
                          <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary}>
                            {item.quantity}× {item.nameSnapshot}
                          </StyledText>
                          {item.modifiers.length > 0 && (
                            <StyledText fontSize={12.5} color={COLORS.textMuted}>
                              {item.modifiers.map((m) => m.optionName).join(", ")}
                            </StyledText>
                          )}
                        </Stack>
                        <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary}>
                          {formatMoney(item.priceCents * item.quantity)}
                        </StyledText>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* ── Payment summary ───────────────────────────────────── */}
              <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={12} style={SHADOW_CARD}>
                <StyledText
                  fontSize={12.5}
                  fontWeight="700"
                  color={COLORS.textMuted}
                  style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
                >
                  Payment summary
                </StyledText>
                <Stack horizontal justifyContent="space-between">
                  <StyledText fontSize={14} color={COLORS.textSecondary}>
                    Subtotal
                  </StyledText>
                  <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                    {formatMoney(order.subtotalCents)}
                  </StyledText>
                </Stack>
                <Stack horizontal justifyContent="space-between">
                  <StyledText fontSize={14} color={COLORS.textSecondary}>
                    Delivery fee
                  </StyledText>
                  <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                    {formatMoney(order.deliveryFeeCents)}
                  </StyledText>
                </Stack>
                {order.discountCents > 0 && (
                  <Stack horizontal justifyContent="space-between">
                    <StyledText fontSize={14} color={COLORS.textSecondary}>
                      Discount
                    </StyledText>
                    <StyledText fontSize={14} fontWeight="700" color={COLORS.success}>
                      -{formatMoney(order.discountCents)}
                    </StyledText>
                  </Stack>
                )}
                <Stack borderTopWidth={1} borderTopColor={COLORS.border} paddingTop={12} horizontal justifyContent="space-between" alignItems="center">
                  <StyledText fontSize={16} fontWeight="800" color={COLORS.textPrimary}>
                    Total
                  </StyledText>
                  <StyledText fontSize={21} fontWeight="800" color={COLORS.primary} style={{ letterSpacing: -0.3 }}>
                    {formatMoney(order.totalCents)}
                  </StyledText>
                </Stack>
              </Stack>

              {/* ── Review — only once the order has actually been delivered ── */}
              {order.status === "DELIVERED" && <ReviewSection orderId={order.id} review={order.review} />}

              {/* ── Delivery address ──────────────────────────────────── */}
              <Stack horizontal alignItems="center" gap={14} backgroundColor={COLORS.bgCard} borderRadius={26} padding={18} style={SHADOW_CARD}>
                <StyledShape size={46} cycle backgroundColor={COLORS.primaryLight}>
                  <Icon name="map-pin" size={19} color={COLORS.primary} />
                </StyledShape>
                <Stack flex={1} gap={2}>
                  <StyledText fontSize={11.5} fontWeight="700" color={COLORS.textMuted} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Delivery to
                  </StyledText>
                  <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                    {order.deliveryAddress}
                  </StyledText>
                </Stack>
              </Stack>

              {/* ── Assurance ──────────────────────────────────────────── */}
              <Stack backgroundColor={COLORS.primaryLight} borderRadius={26} padding={20} gap={16}>
                {ASSURANCE_ITEMS.map((a) => (
                  <Stack key={a.title} horizontal alignItems="center" gap={14}>
                    <StyledShape size={40} cycle backgroundColor="#FFFFFF">
                      <Icon name={a.icon as any} size={17} color={COLORS.primary} />
                    </StyledShape>
                    <Stack flex={1} gap={1}>
                      <StyledText fontSize={13.5} fontWeight="800" color={COLORS.textPrimary}>
                        {a.title}
                      </StyledText>
                      <StyledText fontSize={12} color={COLORS.textSecondary}>
                        {a.body}
                      </StyledText>
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              {/* ── Cancel ─────────────────────────────────────────────── */}
              {CANCELLABLE.includes(order.status) && (
                <ScalePressable onPress={handleCancel} disabled={cancelOrder.isPending} toValue={0.97}>
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical={17}
                    borderRadius={999}
                    borderWidth={1.5}
                    borderColor={COLORS.error}
                    backgroundColor="#FFFFFF"
                  >
                    {cancelOrder.isPending ? (
                      <ActivityIndicator color={COLORS.error} />
                    ) : (
                      <Stack horizontal alignItems="center" gap={8}>
                        <Icon name="trash-2" size={16} color={COLORS.error} />
                        <StyledText fontSize={15} fontWeight="700" color={COLORS.error}>
                          Cancel order
                        </StyledText>
                      </Stack>
                    )}
                  </Stack>
                </ScalePressable>
              )}
            </Stack>
          </Animated.View>
        </Stack>
      </ScrollView>
    </StyledPage>
  );
}

// ─── Header — circular back button, title + subtitle, optional call ───────────
function OrderHeader({
  title,
  subtitle,
  onCall,
}: {
  title: string;
  subtitle: string | null;
  onCall: (() => void) | null;
}) {
  return (
    <StyledPage.Header.Full>
      <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
        <ScalePressable onPress={() => router.back()} toValue={0.88}>
          <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
            <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
          </Stack>
        </ScalePressable>

        <Stack flex={1} alignItems="center" gap={2} paddingHorizontal={8}>
          <StyledText fontSize={17} fontWeight="800" color={COLORS.textPrimary} numberOfLines={1} style={{ letterSpacing: -0.2 }}>
            {title}
          </StyledText>
          {subtitle && (
            <StyledText fontSize={12.5} color={COLORS.textMuted}>
              {subtitle}
            </StyledText>
          )}
        </Stack>

        {onCall ? (
          <ScalePressable onPress={onCall} toValue={0.88}>
            <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor={COLORS.primaryLight} style={SHADOW_SOFT}>
              <Icon name="phone" size={17} color={COLORS.primary} />
            </Stack>
          </ScalePressable>
        ) : (
          <Stack width={40} height={40} />
        )}
      </Stack>
    </StyledPage.Header.Full>
  );
}
