import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  StyledText,
  StyledPressable,
  StyledShape,
  Stack,
  theme,
  StyledImage,
  StyledImageBackground,
  Loader,
} from "fluent-styles";
import { useLocation } from "../../src/location/LocationContext";
import { useRestaurants } from "../../src/hooks/useRestaurants";
import { useCart } from "../../src/cart/CartContext";
import { BasketBar } from "../../src/components/BasketBar";
import { BottomTabBar } from "../../src/components/BottomTabBar";
import { AddressPickerPopup } from "../../src/components/AddressPickerPopup";
import { cuisineEmoji, SUPPORTED_CUISINES } from "../../src/lib/cuisines";
import { formatMoney, kmToMiles } from "../../src/lib/format";
import { COLORS } from "../../src/theme/colors";
import type { Restaurant } from "../../src/api/types";

const H_PAD = 20;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Shadows — every elevated surface uses one of these, no borders ───────────
const SHADOW_SOFT = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};
const SHADOW_CHIP = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};
const SHADOW_CARD = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.09,
  shadowRadius: 22,
  elevation: 5,
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function addressIconName(label: string | null | undefined): string {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home";
  if (l === "work") return "briefcase";
  return "map-pin";
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ─── Small press-scale wrapper — shared button/card feedback ──────────────────
function ScalePressable({
  onPress,
  children,
  style,
  toValue = 0.96,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
  toValue?: number;
}) {
  const anim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.timing(anim, {
      toValue,
      duration: 90,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }
  function pressOut() {
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
      <StyledPressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {children}
      </StyledPressable>
    </Animated.View>
  );
}

// ─── Fade-up mount animation ───────────────────────────────────────────────────
function useFadeUp(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  useState(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  });
  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };
}

// ─── Image that fades + scales in once loaded, instead of a blank flash ───────
function FadeImage({ uri, height }: { uri: string; height: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  function onLoad() {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  return (
    <Stack height={height} overflow="hidden" backgroundColor={COLORS.bgMuted}>
      <Animated.Image
        source={{ uri }}
        onLoad={onLoad}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1.06, 1],
              }),
            },
          ],
        }}
      />
    </Stack>
  );
}

// ─── Cuisine chip — rounded rect, gradient when selected ──────────────────────
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
    <ScalePressable onPress={onPress} style={{ marginRight: 12 }}>
      <Stack
        width={78}
        alignItems="center"
        justifyContent="center"
        borderRadius={22}
        paddingVertical={14}
        paddingHorizontal={8}
        gap={8}
        overflow="hidden"
        backgroundColor={active ? COLORS.primary : "#FFFFFF"}
        style={active ? SHADOW_CTA_CHIP : SHADOW_CHIP}
      >
        {active && (
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Defs>
              <LinearGradient id={`chip-${label}`} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FB923C" stopOpacity={1} />
                <Stop
                  offset="1"
                  stopColor={COLORS.primaryDark}
                  stopOpacity={1}
                />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#chip-${label})`} />
          </Svg>
        )}
        <StyledShape
          size={40}
          cycle
          backgroundColor={
            active ? "rgba(255,255,255,0.22)" : COLORS.primaryLight
          }
        >
          <StyledText fontSize={20}>{emoji}</StyledText>
        </StyledShape>
        <StyledText
          fontSize={11.5}
          fontWeight={active ? "800" : "600"}
          color={active ? "#FFFFFF" : COLORS.textSecondary}
          numberOfLines={1}
        >
          {label}
        </StyledText>
      </Stack>
    </ScalePressable>
  );
}
const SHADOW_CTA_CHIP = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 4,
};

// ─── Restaurant photo pool — used only when a restaurant has no uploaded
// photo yet, keyed off the id so the same restaurant always gets the same
// placeholder rather than a random one on every render. ────────────────────────
const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
];

// ─── Restaurant card ────────────────────────────────────────────────────────
function RestaurantCard({
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
    <ScalePressable onPress={onPress}>
      <Stack
        backgroundColor={theme.colors.white}
        borderRadius={20}
        borderWidth={1}
        borderColor={theme.colors.gray[100]}
        overflow="hidden"
        position="relative"
        flexDirection="column"
        flex={1}
        marginBottom={16}
      >
        <StyledImageBackground
          source={{ uri: image }}
          height={210}
          resizeMode="cover"
        >
          <Svg
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 90,
            }}
          >
            <Defs>
              <LinearGradient
                id={`card-${item.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor="#000000" stopOpacity={0} />
                <Stop offset="1" stopColor="#000000" stopOpacity={0.35} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#card-${item.id})`} />
          </Svg>

          {/* Slots badge */}
          <Stack
            top={14}
            right={14}
            horizontal
            gap={5}
            backgroundColor="rgba(255,255,255,0.94)"
            borderRadius={999}
            paddingHorizontal={11}
            paddingVertical={6}
            flexDirection="row"
            alignItems="center"
            alignSelf="flex-end" 
          >
            <Icon name="clock" size={11} color={COLORS.textPrimary} />
            <StyledText
              fontSize={11}
              fontWeight="700"
              color={COLORS.textPrimary}
            >
              Slots open
            </StyledText>
          </Stack>
        </StyledImageBackground>

        {/* Info */}
        <Stack padding={18} gap={8}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledText
              fontSize={19}
              fontWeight="800"
              color={COLORS.textPrimary}
              numberOfLines={1}
              style={{ letterSpacing: -0.3 }}
            >
              {item.name}
            </StyledText>

            {item.distanceKm != null && (
              <>
                <StyledText fontSize={12} color={COLORS.border}>
                  ·
                </StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted}>
                  {`${kmToMiles(item.distanceKm).toFixed(1)} mi`}
                </StyledText>
              </>
            )}
          </Stack>

          <Stack horizontal alignItems="center" gap={6} flexWrap="wrap">
            <StyledText fontSize={13} color={COLORS.textMuted}>
              {item.cuisine}
            </StyledText>

            {item.averageRating !== null && (
              <Stack horizontal alignItems="center" gap={3} marginLeft={2}>
                <Icon name="star" size={12} color="#F59E0B" />
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={COLORS.textPrimary}
                >
                  {item.averageRating.toFixed(1)}
                </StyledText>
                <StyledText fontSize={12} color={COLORS.textMuted}>
                  ({item.reviewCount}+)
                </StyledText>
              </Stack>
            )}
          </Stack>

          <Stack
            horizontal
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            {item.deliveryFeeCents === 0 ? (
              <StyledText
                fontSize={13.5}
                fontWeight="700"
                color={COLORS.primary}
              >
                Free delivery
              </StyledText>
            ) : (
              <Stack horizontal alignItems="center" gap={5}>
                <StyledText fontSize={13}>🚴</StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted}>
                  Delivery
                </StyledText>
                <StyledText
                  fontSize={13.5}
                  fontWeight="700"
                  color={COLORS.primary}
                >
                  {formatMoney(item.deliveryFeeCents)}
                </StyledText>
              </Stack>
            )}
            <Stack
              backgroundColor="#1C1917"
              borderRadius={999}
              paddingHorizontal={14}
              paddingVertical={7}
              style={{
                shadowColor: "#1C1917",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <StyledText fontSize={12} fontWeight="700" color="#FFFFFF">
                {item.minOrderCents === 0
                  ? "No min."
                  : `Min ${formatMoney(item.minOrderCents)}`}
              </StyledText>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </ScalePressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ResultsScreen() {
  const { active, setActive } = useLocation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const cart = useCart();

  const chipsAnim = useFadeUp(0);
  const listAnim = useFadeUp(100);

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
        backgroundColor={COLORS.bg}
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

  const pillLabel = active?.label
    ? `${active.label} · ${active.formattedAddress.split(",")[0]}`
    : active?.formattedAddress
      ? active.formattedAddress.split(",").slice(0, 2).join(",")
      : status === "loading"
        ? "Detecting location…"
        : "Set your address";

  return (
    <StyledPage showStatusBar flex={1} backgroundColor={COLORS.bg}>
      <StyledPage.Header.Full>
        <Stack paddingHorizontal={H_PAD} paddingTop={8} gap={16}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <Stack horizontal alignItems="center" gap={12} flex={1}>
              <Stack
                style={[
                  { borderRadius: 24, backgroundColor: "#FFFFFF" },
                  SHADOW_SOFT,
                ]}
              >
                <StyledShape size={48} cycle backgroundColor="transparent">
                  <Icon
                    name="user"
                    size={19}
                    //  color={user ? COLORS.primary : COLORS.textMuted}
                  />
                </StyledShape>
              </Stack>
              <Stack gap={2} flex={1}>
                <StyledText
                  fontSize={10.5}
                  fontWeight="300"
                  paddingLeft={3}
                  color={COLORS.textMuted}
                  letterSpacing={0.6}
                  textTransform="uppercase"
                >
                  Delivering to
                </StyledText>
                <StyledPressable
                  onPress={() => setPickerOpen(true)}
                  flexDirection="row"
                  alignItems="center"
                  gap={6}
                >
                  <Icon
                    name={addressIconName(active.label) as any}
                    size={14}
                    color={COLORS.primary}
                  />
                  <StyledText
                    fontSize={18}
                    fontWeight="800"
                    color={COLORS.textPrimary}
                    numberOfLines={1}
                    style={{
                      maxWidth: SCREEN_WIDTH - 130,
                      letterSpacing: -0.3,
                    }}
                  >
                    {pillLabel}
                  </StyledText>
                  <Icon name="chevron-down" size={15} color={COLORS.primary} />
                </StyledPressable>
              </Stack>
            </Stack>
            <StyledPressable
              style={[
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                },
                SHADOW_SOFT,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Icon name="bell" size={19} color={COLORS.textPrimary} />
            </StyledPressable>
          </Stack>

          <StyledPressable onPress={() => setPickerOpen(true)}>
            <Stack
              horizontal
              alignItems="center"
              gap={10}
              borderRadius={999}
              paddingHorizontal={18}
              paddingVertical={14}
              backgroundColor="#FFFFFF"
              style={SHADOW_SOFT}
            >
              <Icon name="search" size={16} color={COLORS.textMuted} />
              <StyledText fontSize={13.5} color={COLORS.textMuted} flex={1}>
                Search by address to see restaurants…
              </StyledText>
              <Stack
                width={1}
                height={20}
                backgroundColor={COLORS.border}
                marginHorizontal={2}
              />
              <Icon name="sliders" size={16} color={COLORS.textMuted} />
            </Stack>
          </StyledPressable>
        </Stack>
      </StyledPage.Header.Full>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 8 }}
      >
        {/* Cuisine chips */}
        <Animated.View style={chipsAnim}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: H_PAD }}
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
        </Animated.View>

        {/* Loading / error */}
        {isLoading && (
          <Stack alignItems="center" paddingVertical={60}>
            <Loader variant="spinner" color={COLORS.primary} />
          </Stack>
        )}
        {error && (
          <Stack
            marginHorizontal={H_PAD}
            marginTop={20}
            padding={16}
            borderRadius={18}
            backgroundColor={COLORS.errorLight}
          >
            <StyledText fontSize={14} color={COLORS.error}>
              Could not load restaurants. Check your connection.
            </StyledText>
          </Stack>
        )}

        {/* No coverage — elegant empty state */}
        {!isLoading && !error && (restaurants ?? []).length === 0 && (
          <Stack
            alignItems="center"
            paddingVertical={56}
            paddingHorizontal={36}
            gap={14}
          >
            <StyledShape size={88} cycle backgroundColor={COLORS.primaryLight}>
              <Icon name="map-pin" size={34} color={COLORS.primary} />
            </StyledShape>
            <StyledText
              fontSize={17}
              fontWeight="800"
              color={COLORS.textPrimary}
              textAlign="center"
            >
              No restaurants deliver here yet
            </StyledText>
            <StyledText
              fontSize={13.5}
              color={COLORS.textMuted}
              textAlign="center"
              lineHeight={19}
            >
              We don't have partners that cover this area. Try a nearby town or
              city.
            </StyledText>
            <ScalePressable onPress={() => setPickerOpen(true)}>
              <Stack
                backgroundColor={COLORS.primary}
                borderRadius={999}
                paddingHorizontal={20}
                paddingVertical={12}
                marginTop={4}
                style={SHADOW_CTA_CHIP}
              >
                <StyledText fontSize={13.5} fontWeight="700" color="#FFFFFF">
                  Try a different address
                </StyledText>
              </Stack>
            </ScalePressable>
          </Stack>
        )}

        {/* Restaurants nearby */}
        {!isLoading && !error && filtered.length > 0 && (
          <Animated.View style={listAnim}>
            <Stack marginTop={28} paddingHorizontal={H_PAD}>
              <Stack
                marginBottom={18}
                gap={2}
                justifyContent="space-between"
                alignItems="center"
                horizontal
              >
                <StyledText
                  fontSize={21}
                  fontWeight="800"
                  color={COLORS.textPrimary}
                  style={{ letterSpacing: -0.3 }}
                >
                  {cuisineFilter ? `${cuisineFilter} near you` : "🔥 Near You"}
                </StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted}>
                  {filtered.length} place{filtered.length === 1 ? "" : "s"}{" "}
                </StyledText>
              </Stack>
              {filtered.map((item) => (
                <RestaurantCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/restaurant/${item.id}`)}
                />
              ))}
            </Stack>
          </Animated.View>
        )}

        {/* Cuisine empty */}
        {!isLoading &&
          !error &&
          cuisineFilter &&
          filtered.length === 0 &&
          (restaurants ?? []).length > 0 && (
            <Stack alignItems="center" paddingVertical={40} gap={10}>
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
