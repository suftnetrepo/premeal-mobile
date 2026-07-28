import { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  StyledHeader,
  StyledText,
  StyledPressable,
  StyledShape,
  Stack,
  theme,
} from "fluent-styles";
import {
  useLocation,
  type ActiveLocation,
} from "../../src/location/LocationContext";
import { useAuth } from "../../src/auth/AuthContext";
import { useCart } from "../../src/cart/CartContext";
import { BasketBar } from "../../src/components/BasketBar";
import { BottomTabBar } from "../../src/components/BottomTabBar";
import { AddressPickerPopup } from "../../src/components/AddressPickerPopup";
import { COLORS } from "../../src/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: "schedule",
    pill: "Scheduled delivery",
    title: "Order ahead,\neat on time.",
    subtitle: "Confirmed within 30 min",
    cta: "Explore now",
  },
  {
    key: "transparent",
    pill: "Fair pricing",
    title: "No markups,\nno surprises.",
    subtitle: "You pay what the restaurant charges",
    cta: "See restaurants",
  },
  {
    key: "reviews",
    pill: "Verified reviews",
    title: "Reviews you\ncan trust.",
    subtitle: "Every review is from a real delivery",
    cta: "Browse now",
  },
];

// ─── Platform value props — mirrors premeal-app's own homepage tiles, same
// real, defensible claims, no numbers that would need a live stats endpoint
// to back up. ────────────────────────────────────────────────────────────────
const VALUE_PROPS: { icon: string; title: string; body: string }[] = [
  {
    icon: "calendar",
    title: "Schedule, not rush",
    body: "Book your delivery slot days ahead.",
  },
  {
    icon: "shield",
    title: "Real reviews only",
    body: "Reviews come from orders actually delivered.",
  },
  {
    icon: "check-circle",
    title: "Confirmed fast",
    body: "Restaurants respond within 30 minutes.",
  },
  {
    icon: "credit-card",
    title: "Fair & transparent",
    body: "You pay exactly what the restaurant charges.",
  },
];

// ─── For restaurant owners — purely informational for now, no signup link
// yet, so deliberately no button here (a dead CTA would be worse than none). ──
const RESTAURANT_POINTS: string[] = [
  "Keep 88% of every order — 12% commission on food only, never on delivery",
  "Set your own delivery radius and fee",
  "Deliver yourself, or invite your own drivers",
  "One-time signup fee, no monthly subscription",
];

function addressIconName(label: string | null | undefined): string {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home";
  if (l === "work") return "briefcase";
  return "map-pin";
}

export default function DiscoverScreen() {
  const sliderRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"list" | "search">("list");

  const { active, status, setActive } = useLocation();
  const { user } = useAuth();
  const cart = useCart();

  function handleSliderScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== slideIndex) setSlideIndex(idx);
  }

  function openPicker(mode: "list" | "search") {
    setPickerMode(mode);
    setPickerOpen(true);
  }

  // Picking a location here is the whole point of this screen — hand off
  // to /results immediately rather than showing anything restaurant-related
  // in place. Discover only ever does one job: get a location, then get out
  // of the way.
  function handleLocationSelected(loc: ActiveLocation) {
    setActive(loc);
    router.push("/results");
  }

  const pillLabel = active?.label
    ? `${active.label} · ${active.formattedAddress.split(",")[0]}`
    : active?.formattedAddress
      ? active.formattedAddress.split(",").slice(0, 2).join(",")
      : status === "loading"
        ? "Detecting location…"
        : "Set your address";

  return (
    <StyledPage showStatusBar backgroundColor={theme.colors.gray[1]}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <StyledPage.Header.Full>
        <Stack
          vertical
          paddingHorizontal={H_PAD}
          paddingTop={6}
          paddingBottom={14}
          gap={12}
        >
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <Stack horizontal alignItems="center" gap={10}>
              <StyledShape
                size={48}
                cycle
                backgroundColor={user ? COLORS.primaryLight : COLORS.bgMuted}
                borderWidth={user ? 2 : 0}
                borderColor={COLORS.primary}
              >
                <Icon
                  name="user"
                  size={18}
                  color={user ? COLORS.primary : COLORS.textMuted}
                />
              </StyledShape>
              <Stack gap={2}>
                <StyledText fontSize={10} color={COLORS.textMuted}>
                  Delivering to
                </StyledText>
                <StyledPressable
                  flexDirection="row"
                  alignItems="center"
                  gap={4}
                  onPress={() => openPicker("list")}
                >
                  <Icon
                    name={
                      active?.label
                        ? (addressIconName(active.label) as any)
                        : "map-pin"
                    }
                    size={12}
                    color={COLORS.primary}
                  />
                  <StyledText
                    fontSize={13}
                    fontWeight="700"
                    color={COLORS.textPrimary}
                    numberOfLines={1}
                    style={{ maxWidth: SCREEN_WIDTH - 160 }}
                  >
                    {pillLabel}
                  </StyledText>
                  <Icon name="chevron-down" size={12} color={COLORS.primary} />
                </StyledPressable>
              </Stack>
            </Stack>
            <StyledPressable>
              <StyledShape
                size={48}
                cycle
                borderWidth={user ? 2 : 1}
                borderColor={COLORS.primaryDark}
              >
                <Icon name="bell" size={18} color={COLORS.textPrimary} />
              </StyledShape>
            </StyledPressable>
          </Stack>

          <StyledPressable
            flexDirection="row"
            alignItems="center"
            gap={10}
            borderWidth={1}
            borderColor={COLORS.border}
            borderRadius={12}
            paddingHorizontal={14}
            paddingVertical={11}
            backgroundColor={COLORS.bgMuted}
            onPress={() => openPicker("search")}
          >
            <Icon name="search" size={15} color={COLORS.textMuted} />
            <StyledText fontSize={13} color={COLORS.textMuted}>
              Search by address to see restaurants…
            </StyledText>
          </StyledPressable>
        </Stack>
      </StyledPage.Header.Full>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
      >
        {/* Hero slider */}
        <Stack height={206} overflow="hidden">
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleSliderScroll}
            style={{ width: SCREEN_WIDTH }}
          >
            {SLIDES.map((slide) => (
              <Stack
                key={slide.key}
                width={SCREEN_WIDTH}
                paddingHorizontal={H_PAD}
              >
                <StyledPressable
                  flex={1}
                  onPress={() => openPicker(active ? "list" : "search")}
                  backgroundColor={COLORS.primary}
                  borderRadius={20}
                  overflow="hidden"
                  justifyContent="flex-end"
                  padding={20}
                >
                  <Stack
                    position="absolute"
                    top={-20}
                    right={-20}
                    width={130}
                    height={130}
                    borderRadius={65}
                    backgroundColor="rgba(255,255,255,0.10)"
                  />
                  <Stack
                    position="absolute"
                    top={40}
                    right={50}
                    width={80}
                    height={80}
                    borderRadius={40}
                    backgroundColor="rgba(255,255,255,0.07)"
                  />
                  <Stack
                    position="absolute"
                    bottom={-30}
                    right={20}
                    width={110}
                    height={110}
                    borderRadius={55}
                    backgroundColor="rgba(255,255,255,0.07)"
                  />
                  <Stack gap={6} style={{ zIndex: 1 }}>
                    <Stack
                      backgroundColor="rgba(255,255,255,0.22)"
                      borderRadius={999}
                      paddingHorizontal={10}
                      paddingVertical={4}
                      alignSelf="flex-start"
                    >
                      <StyledText
                        fontSize={11}
                        fontWeight="700"
                        color="#FFFFFF"
                      >
                        {slide.pill}
                      </StyledText>
                    </Stack>
                    <StyledText
                      fontSize={20}
                      fontWeight="800"
                      color="#FFFFFF"
                      lineHeight={26}
                      style={{ letterSpacing: -0.3 }}
                    >
                      {slide.title}
                    </StyledText>
                    <StyledText fontSize={13} color="rgba(255,255,255,0.85)">
                      {slide.subtitle}
                    </StyledText>
                    <Stack
                      backgroundColor="#1C1917"
                      borderRadius={999}
                      paddingHorizontal={18}
                      paddingVertical={9}
                      alignSelf="flex-start"
                      marginTop={2}
                    >
                      <StyledText
                        fontSize={13}
                        fontWeight="700"
                        color="#FFFFFF"
                      >
                        {slide.cta}
                      </StyledText>
                    </Stack>
                  </Stack>
                </StyledPressable>
              </Stack>
            ))}
          </ScrollView>
        </Stack>

        <Stack
          horizontal
          justifyContent="center"
          alignItems="center"
          gap={5}
          marginTop={10}
          marginBottom={22}
        >
          {SLIDES.map((_, i) => (
            <Stack
              key={i}
              width={i === slideIndex ? 18 : 6}
              height={6}
              borderRadius={3}
              backgroundColor={
                i === slideIndex ? COLORS.primary : COLORS.border
              }
            />
          ))}
        </Stack>

        {/* ── Platform value props ───────────────────────────────── */}
        <Stack paddingHorizontal={H_PAD} marginBottom={24}>
          <StyledText
            fontSize={18}
            fontWeight="800"
            color={COLORS.textPrimary}
            marginBottom={12}
          >
            Why Pre-Meal
          </StyledText>
          <Stack horizontal flexWrap="wrap" gap={10}>
            {VALUE_PROPS.map((v) => (
              <Stack
                key={v.title}
                width="47%"
                backgroundColor={COLORS.bgCard}
                borderRadius={16}
                borderWidth={0.5}
                borderColor={COLORS.border}
                padding={14}
                gap={8}
              >
                <StyledShape
                  size={34}
                  borderRadius={17}
                  backgroundColor={COLORS.primaryLight}
                >
                  <Icon name={v.icon as any} size={16} color={COLORS.primary} />
                </StyledShape>
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={COLORS.textPrimary}
                >
                  {v.title}
                </StyledText>
                <StyledText
                  fontSize={12}
                  color={COLORS.textMuted}
                  lineHeight={16}
                >
                  {v.body}
                </StyledText>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* ── For restaurant owners — informational only ─────────── */}
        <Stack
          marginHorizontal={H_PAD}
          marginBottom={12}
          borderRadius={18}
          overflow="hidden"
          backgroundColor="#1C1917"
          padding={20}
          gap={12}
        >
          <Stack horizontal alignItems="center" gap={8}>
            <StyledShape
              size={30}
              borderRadius={15}
              backgroundColor="rgba(255,255,255,0.12)"
            >
              <Icon name="briefcase" size={14} color="#FFFFFF" />
            </StyledShape>
            <StyledText fontSize={15} fontWeight="800" color="#FFFFFF">
              Own a restaurant?
            </StyledText>
          </Stack>
          <Stack gap={8}>
            {RESTAURANT_POINTS.map((point) => (
              <Stack key={point} horizontal alignItems="flex-start" gap={8}>
                <Icon
                  name="check"
                  size={13}
                  color={COLORS.primary}
                  style={{ marginTop: 2 }}
                />
                <StyledText
                  fontSize={13}
                  color="rgba(255,255,255,0.85)"
                  lineHeight={18}
                  flex={1}
                >
                  {point}
                </StyledText>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </ScrollView>

      {cart.itemCount > 0 && <BasketBar />}
      <BottomTabBar active="home" />

      <AddressPickerPopup
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        activeAddressId={active?.addressId}
        onLocationSelected={handleLocationSelected}
        initialMode={pickerMode}
      />
    </StyledPage>
  );
}
