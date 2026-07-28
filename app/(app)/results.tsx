import { useState } from "react";
import { ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  theme,
  StyledText,
  StyledPressable,
  StyledBadge,
  StyledSeperator,
  StyledImageBackground,
  StyledShape,
  Stack,
} from "fluent-styles";
import { useLocation } from "../../src/location/LocationContext";
import { useRestaurants } from "../../src/hooks/useRestaurants";
import { useCart } from "../../src/cart/CartContext";
import { BasketBar } from "../../src/components/BasketBar";
import { BottomTabBar } from "../../src/components/BottomTabBar";
import { AddressPickerPopup } from "../../src/components/AddressPickerPopup";
import { cuisineEmoji, SUPPORTED_CUISINES } from "../../src/lib/cuisines";
import { formatMoney } from "../../src/lib/format";
import { COLORS } from "../../src/theme/colors";
import type { Restaurant } from "../../src/api/types";

const H_PAD = 16;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = SCREEN_WIDTH * 0.58;

// ─── helpers ──────────────────────────────────────────────────────────────────
function addressIconName(label: string | null | undefined): string {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home";
  if (l === "work") return "briefcase";
  return "map-pin";
}

// ─── Cuisine chip ─────────────────────────────────────────────────────────────
function CuisineChip({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <StyledPressable
      onPress={onPress}
      alignItems="center"
      gap={6}
      marginRight={12}
    >
      <StyledShape
        size={60}
        cycle
        borderRadius={16}
        backgroundColor={active ? COLORS.primary : "#1C1917"}
      >
        <StyledText fontSize={24}>{emoji}</StyledText>
      </StyledShape>
      <StyledText
        fontSize={12}
        fontWeight={active ? "700" : "400"}
        color={active ? COLORS.primary : COLORS.textSecondary}
      >
        {label}
      </StyledText>
    </StyledPressable>
  );
}

// ─── Horizontal restaurant card ───────────────────────────────────────────────
const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80",
];

function HorizontalCard({
  item,
  onPress,
}: {
  item: Restaurant;
  onPress: () => void;
}) {
  const image =
    item.imageUrl ??
    CARD_IMAGES[Math.abs(item.id.charCodeAt(0)) % CARD_IMAGES.length];
  return (
    <StyledPressable
      onPress={onPress}
      width={CARD_W}
      marginRight={14}
      borderRadius={18}
      overflow="hidden"
      backgroundColor={COLORS.bgCard}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Photo */}
      <Stack height={155} overflow="hidden">
        <StyledImageBackground
          source={{ uri: image }}
          height={155}
          resizeMode="cover"
        />
        {/* Heart */}
        <StyledPressable
          position="absolute"
          top={10}
          right={10}
          width={32}
          height={32}
          borderRadius={16}
          backgroundColor="rgba(255,255,255,0.92)"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name="heart" size={14} color={COLORS.textMuted} />
        </StyledPressable>
        {/* Time badge */}
        <Stack
          position="absolute"
          bottom={10}
          left={10}
          flexDirection="row"
          alignItems="center"
          gap={4}
          backgroundColor="rgba(255,255,255,0.92)"
          borderRadius={999}
          paddingHorizontal={10}
          paddingVertical={5}
        >
          <Icon name="clock" size={11} color={COLORS.textPrimary} />
          <StyledText fontSize={11} fontWeight="700" color={COLORS.textPrimary}>
            Slots open
          </StyledText>
        </Stack>
      </Stack>

      {/* Info */}
      <Stack padding={12} gap={5}>
        <StyledText
          fontSize={15}
          fontWeight="800"
          color={COLORS.textPrimary}
          numberOfLines={1}
        >
          {item.name}
        </StyledText>

        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack flexDirection="row" alignItems="center" gap={5}>
            <StyledShape
              size={18}
              borderRadius={4}
              backgroundColor={COLORS.primaryLight}
            >
              <Icon name="shopping-bag" size={10} color={COLORS.primary} />
            </StyledShape>
            <StyledText
              fontSize={12}
              color={COLORS.textSecondary}
              numberOfLines={1}
            >
              {item.cuisine}
            </StyledText>
          </Stack>
          {item.averageRating !== null && (
            <Stack flexDirection="row" alignItems="center" gap={3}>
              <Icon name="star" size={11} color="#F59E0B" />
              <StyledText
                fontSize={12}
                fontWeight="700"
                color={COLORS.textPrimary}
              >
                {item.averageRating.toFixed(1)}
              </StyledText>
              <StyledText fontSize={11} color={COLORS.textMuted}>
                ({item.reviewCount}+)
              </StyledText>
            </Stack>
          )}
        </Stack>

        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText fontSize={12} fontWeight="600" color={COLORS.primary}>
            {item.deliveryFeeCents === 0
              ? "Free delivery"
              : `${formatMoney(item.deliveryFeeCents)} delivery`}
          </StyledText>
          <Stack
            backgroundColor="#1C1917"
            borderRadius={999}
            paddingHorizontal={12}
            paddingVertical={5}
          >
            <StyledText fontSize={12} fontWeight="700" color="#FFFFFF">
              {item.minOrderCents === 0
                ? "No min."
                : `Min ${formatMoney(item.minOrderCents)}`}
            </StyledText>
          </Stack>
        </Stack>
      </Stack>
    </StyledPressable>
  );
}

// ─── Compact vertical restaurant row ─────────────────────────────────────────
function RestaurantRow({
  item,
  onPress,
}: {
  item: Restaurant;
  onPress: () => void;
}) {
  const image =
    item.imageUrl ??
    CARD_IMAGES[Math.abs(item.id.charCodeAt(0)) % CARD_IMAGES.length];
  return (
    <StyledPressable
      onPress={onPress}
      flexDirection="row"
      alignItems="center"
      gap={14}
      marginBottom={12}
      padding={12}
      borderRadius={16}
      backgroundColor={COLORS.bgCard}
      borderWidth={0.5}
      borderColor={COLORS.border}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Stack
        width={72}
        height={72}
        borderRadius={14}
        overflow="hidden"
        backgroundColor={COLORS.primaryLight}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {item.imageUrl ? (
          <StyledImageBackground
            source={{ uri: image }}
            height={72}
            resizeMode="cover"
            style={{ width: 72 }}
          />
        ) : (
          <StyledText fontSize={28}>{cuisineEmoji(item.cuisine)}</StyledText>
        )}
      </Stack>

      <Stack flex={1} gap={4}>
        <StyledText
          fontSize={15}
          fontWeight="700"
          color={COLORS.textPrimary}
          numberOfLines={1}
        >
          {item.name}
        </StyledText>
        <Stack flexDirection="row" alignItems="center" gap={5}>
          {item.averageRating !== null ? (
            <>
              <Icon name="star" size={12} color="#F59E0B" />
              <StyledText
                fontSize={12}
                fontWeight="700"
                color={COLORS.textPrimary}
              >
                {item.averageRating.toFixed(1)}
              </StyledText>
              <StyledText fontSize={12} color={COLORS.textMuted}>
                · {item.cuisine}
              </StyledText>
            </>
          ) : (
            <StyledText fontSize={12} color={COLORS.textMuted}>
              New · {item.cuisine}
            </StyledText>
          )}
        </Stack>
        <Stack flexDirection="row" alignItems="center" gap={6}>
          <Stack flexDirection="row" alignItems="center" gap={4}>
            <Icon name="truck" size={11} color={COLORS.textMuted} />
            <StyledText fontSize={11} color={COLORS.textMuted}>
              {item.deliveryFeeCents === 0
                ? "Free delivery"
                : `${formatMoney(item.deliveryFeeCents)} delivery`}
            </StyledText>
          </Stack>
          <StyledText fontSize={11} color={COLORS.border}>
            ·
          </StyledText>
          <StyledText fontSize={11} color={COLORS.textMuted}>
            {item.minOrderCents === 0
              ? "No min."
              : `Min. ${formatMoney(item.minOrderCents)}`}
          </StyledText>
        </Stack>
      </Stack>

      <Icon name="chevron-right" size={16} color={COLORS.border} />
    </StyledPressable>
  );
}

// ─── Promo banner ─────────────────────────────────────────────────────────────
function PromoBanner() {
  return (
    <Stack
      marginHorizontal={H_PAD}
      borderRadius={20}
      backgroundColor={COLORS.primary}
      overflow="hidden"
      height={160}
      justifyContent="center"
      padding={20}
    >
      <Stack
        position="absolute"
        top={-20}
        right={-20}
        width={120}
        height={120}
        borderRadius={60}
        backgroundColor="rgba(255,255,255,0.10)"
      />
      <Stack
        position="absolute"
        bottom={-30}
        right={40}
        width={100}
        height={100}
        borderRadius={50}
        backgroundColor="rgba(255,255,255,0.07)"
      />

      <Stack gap={8} style={{ zIndex: 1, maxWidth: "70%" }}>
        {/* Code row */}
        <Stack flexDirection="row" alignItems="center" gap={6} flexWrap="wrap">
          <StyledText fontSize={12} color="rgba(255,255,255,0.85)">
            Use code
          </StyledText>
          <StyledBadge
            backgroundColor="#FFFFFF"
            color={COLORS.primary}
            paddingHorizontal={10}
            paddingVertical={3}
            borderRadius={999}
            fontWeight="800"
            fontSize={11}
          >
            FIRST50
          </StyledBadge>
          <StyledText fontSize={12} color="rgba(255,255,255,0.85)">
            at checkout
          </StyledText>
        </Stack>

        <StyledText
          fontSize={20}
          fontWeight="800"
          color="#FFFFFF"
          lineHeight={26}
          style={{ letterSpacing: -0.3 }}
        >
          Get 50% Off{"\n"}Your First Order!
        </StyledText>

        <StyledPressable
          backgroundColor="#1C1917"
          borderRadius={999}
          paddingHorizontal={16}
          paddingVertical={8}
          alignSelf="flex-start"
        >
          <StyledText fontSize={12} fontWeight="700" color="#FFFFFF">
            Order Now
          </StyledText>
        </StyledPressable>
      </Stack>
    </Stack>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ResultsScreen() {
  const { active, setActive } = useLocation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const cart = useCart();

  const {
    data: restaurants,
    isLoading,
    error,
  } = useRestaurants(active ? { lat: active.lat, lng: active.lng } : undefined);

  const filtered = cuisineFilter
    ? (restaurants ?? []).filter((r) => r.cuisine === cuisineFilter)
    : (restaurants ?? []);

  if (!active) {
    return (
      <StyledPage
        flex={1}
        backgroundColor="#F8F8F8"
        alignItems="center"
        justifyContent="center"
        padding={24}
      >
        <StyledText
          fontSize={15}
          color={COLORS.textMuted}
          textAlign="center"
          marginBottom={16}
        >
          Set a delivery address to see restaurants.
        </StyledText>
        <StyledPressable
          onPress={() => router.replace("/")}
          backgroundColor={COLORS.primary}
          borderRadius={999}
          paddingHorizontal={20}
          paddingVertical={12}
        >
          <StyledText fontSize={14} fontWeight="700" color="#FFFFFF">
            Set address
          </StyledText>
        </StyledPressable>
      </StyledPage>
    );
  }

  return (
    <StyledPage showStatusBar flex={1} backgroundColor={theme.colors.gray[1]}>
      {/* ── Header: StyledHeader + StyledHeader.Full (per llm.md) ─────── */}
      <StyledPage.Header.Full>
        <Stack
          paddingHorizontal={H_PAD}
          paddingTop={6}
          paddingBottom={14}
          gap={12}
        >
          {/* Row 1: location + bell */}
          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <StyledPressable
              onPress={() => setPickerOpen(true)}
              flexDirection="row"
              alignItems="center"
              gap={5}
              flex={1}
            >
              <Icon
                name={addressIconName(active.label) as any}
                size={15}
                color={COLORS.primary}
              />
              <StyledText
                fontSize={15}
                fontWeight="700"
                color={COLORS.textPrimary}
                numberOfLines={1}
                style={{ maxWidth: SCREEN_WIDTH - 100 }}
              >
                {active.label ?? active.formattedAddress.split(",")[0]}
              </StyledText>
              <Icon name="chevron-down" size={13} color={COLORS.primary} />
            </StyledPressable>

            <Stack position="relative">
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                borderWidth={1}
                borderColor={COLORS.border}
                alignItems="center"
                justifyContent="center"
                backgroundColor="#FFFFFF"
              >
                <Icon name="bell" size={18} color={COLORS.textPrimary} />
              </Stack>
              <Stack
                position="absolute"
                top={2}
                right={2}
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={COLORS.primary}
                borderWidth={1.5}
                borderColor="#FFFFFF"
              />
            </Stack>
          </Stack>

          {/* Row 2: search + mic */}
          <Stack
            flexDirection="row"
            alignItems="center"
            gap={10}
            borderWidth={1}
            borderColor={COLORS.border}
            borderRadius={999}
            paddingHorizontal={16}
            paddingVertical={11}
            backgroundColor={COLORS.bgMuted}
          >
            <Icon name="search" size={15} color={COLORS.textMuted} />
            <StyledText fontSize={13} color={COLORS.textMuted} flex={1}>
              Search by restaurant or dish…
            </StyledText>
            <Stack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={COLORS.primaryLight}
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="mic" size={14} color={COLORS.primary} />
            </Stack>
          </Stack>
        </Stack>
      </StyledPage.Header.Full>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
      >
        {/* Cuisine chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 4 }}
        >
          <CuisineChip
            label="All"
            emoji="🍽️"
            active={cuisineFilter === null}
            onPress={() => setCuisineFilter(null)}
          />
          {SUPPORTED_CUISINES.map((c) => (
            <CuisineChip
              key={c}
              label={c}
              emoji={cuisineEmoji(c)}
              active={cuisineFilter === c}
              onPress={() => setCuisineFilter(cuisineFilter === c ? null : c)}
            />
          ))}
        </ScrollView>

        {/* Loading / error */}
        {isLoading && (
          <Stack alignItems="center" paddingVertical={40}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </Stack>
        )}
        {error && (
          <Stack
            marginHorizontal={H_PAD}
            marginTop={12}
            padding={14}
            borderRadius={12}
            backgroundColor={COLORS.errorLight}
          >
            <StyledText fontSize={14} color={COLORS.error}>
              Could not load restaurants. Check your connection.
            </StyledText>
          </Stack>
        )}

        {/* No coverage */}
        {!isLoading && !error && (restaurants ?? []).length === 0 && (
          <Stack
            alignItems="center"
            paddingVertical={40}
            paddingHorizontal={32}
            gap={10}
          >
            <Icon name="map-pin" size={32} color={COLORS.border} />
            <StyledText
              fontSize={15}
              fontWeight="700"
              color={COLORS.textPrimary}
              textAlign="center"
            >
              No restaurants deliver here yet
            </StyledText>
            <StyledText
              fontSize={13}
              color={COLORS.textMuted}
              textAlign="center"
            >
              We don't have partners that cover this area. Try a nearby town or
              city.
            </StyledText>
            <StyledPressable onPress={() => setPickerOpen(true)} marginTop={4}>
              <StyledText fontSize={13} fontWeight="700" color={COLORS.primary}>
                Try a different address →
              </StyledText>
            </StyledPressable>
          </Stack>
        )}

        {/* Top picks — horizontal */}
        {!isLoading && !error && filtered.length > 0 && (
          <Stack marginTop={20}>
            <StyledSeperator
              leftLabel="Top picks near you"
              rightLabel="See all"
              marginHorizontal={H_PAD}
              marginBottom={14}
              leftLabelProps={{
                fontSize: 19,
                fontWeight: "800",
                color: COLORS.textPrimary,
              }}
              rightLabelProps={{
                fontSize: 13,
                fontWeight: "700",
                color: COLORS.primary,
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: H_PAD,
                paddingBottom: 4,
              }}
            >
              {filtered.map((item) => (
                <HorizontalCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/restaurant/${item.id}`)}
                />
              ))}
            </ScrollView>
          </Stack>
        )}

        {/* All restaurants — vertical */}
        {!isLoading && !error && filtered.length > 0 && (
          <Stack marginTop={24} paddingHorizontal={H_PAD}>
            <StyledSeperator
              leftLabel={
                cuisineFilter ? `${cuisineFilter} near you` : "All restaurants"
              }
              rightLabel={`${filtered.length} places`}
              marginBottom={14}
              leftLabelProps={{
                fontSize: 19,
                fontWeight: "800",
                color: COLORS.textPrimary,
              }}
              rightLabelProps={{ fontSize: 13, color: COLORS.textMuted }}
            />
            {filtered.map((item) => (
              <RestaurantRow
                key={item.id}
                item={item}
                onPress={() => router.push(`/restaurant/${item.id}`)}
              />
            ))}
          </Stack>
        )}

        {/* Cuisine empty */}
        {!isLoading &&
          !error &&
          cuisineFilter &&
          filtered.length === 0 &&
          (restaurants ?? []).length > 0 && (
            <Stack alignItems="center" paddingVertical={32} gap={8}>
              <StyledText
                fontSize={14}
                color={COLORS.textMuted}
                textAlign="center"
              >
                No {cuisineFilter} restaurants deliver here yet.
              </StyledText>
              <StyledPressable onPress={() => setCuisineFilter(null)}>
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={COLORS.primary}
                >
                  Browse all cuisines
                </StyledText>
              </StyledPressable>
            </Stack>
          )}
      </ScrollView>

      {cart.itemCount > 0 && <BasketBar />}
      <BottomTabBar active="home" />

      <AddressPickerPopup
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        activeAddressId={active.addressId}
        onLocationSelected={setActive}
      />
    </StyledPage>
  );
}
