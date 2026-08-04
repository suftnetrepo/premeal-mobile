import { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  StyledText,
  StyledPressable,
  StyledShape,
  StyledImageBackground,
  Stack,
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
const H_PAD = 20;

// ─── Shadows — every elevated surface shares one of these, no borders ─────────
const SHADOW_SOFT = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};
const SHADOW_CARD = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 18,
  elevation: 4,
};
const SHADOW_HERO = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.18,
  shadowRadius: 28,
  elevation: 10,
};
const SHADOW_CTA = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 6,
};

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: "schedule",
    pill: "Scheduled delivery",
    titleLead: "Order ahead,\neat ",
    titleHighlight: "on time.",
    subtitle: "Confirmed within 30 min",
    cta: "Explore now",
    image:
      require("../../assets/slide_1.png"),
  },
  {
    key: "transparent",
    pill: "Fair pricing",
    titleLead: "No markups,\nno ",
    titleHighlight: "surprises.",
    subtitle: "You pay what the restaurant charges",
    cta: "See restaurants",
    image:
      require("../../assets/slide_2.png"),
  },
  {
    key: "reviews",
    pill: "Verified reviews",
    titleLead: "Reviews you\ncan ",
    titleHighlight: "trust.",
    subtitle: "Every review is from a real delivery",
    cta: "Browse now",
    image:
      require("../../assets/slide_3.png"),
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
    icon: "zap",
    title: "Confirmed fast",
    body: "Restaurants respond within 30 minutes.",
  },
  {
    icon: "credit-card",
    title: "Fair & transparent",
    body: "You pay exactly what the restaurant charges.",
  },
];

function addressIconName(label: string | null | undefined): string {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home";
  if (l === "work") return "briefcase";
  return "map-pin";
}

// ─── Small press-scale wrapper — shared button/card feedback ──────────────────
function ScalePressable({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.timing(anim, {
      toValue: 0.96,
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
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // Mount-only fade — no dependency on `anim` (stable ref).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };
}

export default function DiscoverScreen() {
  const sliderRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"list" | "search">("list");

  const { active, status, setActive } = useLocation();
  const { user } = useAuth();
  const cart = useCart();

  const heroAnimStyle = useFadeUp(0);
  const valuePropsAnimStyle = useFadeUp(120);

  // Returning user — location seeding (SecureStore read, or saved-address
  // lookup) resolves asynchronously, so status is still "loading" on the
  // very first render. Depend on status so this fires once it flips to
  // "ready", not just at mount.
  useEffect(() => {
    if (status === "ready") {
      router.replace("/results");
    }
  }, [status]);

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
    router.replace("/results");
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
                    color={user ? COLORS.primary : COLORS.textMuted}
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
                  flexDirection="row"
                  alignItems="center"
                  gap={5}
                  onPress={() => openPicker("list")}
                >
                  <Icon
                    name={
                      active?.label
                        ? (addressIconName(active.label) as any)
                        : "map-pin"
                    }
                    size={13}
                    color={COLORS.primary}
                  />
                  <StyledText
                    fontSize={16}
                    fontWeight="800"
                    color={COLORS.textPrimary}
                    numberOfLines={1}
                    style={{
                      maxWidth: SCREEN_WIDTH - 190,
                      letterSpacing: -0.2,
                    }}
                  >
                    {pillLabel}
                  </StyledText>
                  <Icon name="chevron-down" size={14} color={COLORS.primary} />
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

          <StyledPressable onPress={() => openPicker("search")}>
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
                Search by address…
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

      {/* ── Body ─────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 28 }}
      >
        {/* Hero slider */}
        <Animated.View style={heroAnimStyle}>
          <Stack height={244} overflow="hidden">
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
                  <ScalePressable
                    onPress={() => openPicker(active ? "list" : "search")}
                    style={[
                      {
                        flex: 1,
                        borderRadius: 28,
                        overflow: "hidden",
                        backgroundColor: "#1C1917",
                      },
                      SHADOW_HERO,
                    ]}
                  >
                    <StyledImageBackground
                      source={slide.image}
                      flex={1}
                      height={250}
                      justifyContent="flex-end"
                      paddingTop={14}
                    >
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
                          <LinearGradient
                            id="hero"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0.15"
                          >
                            <Stop
                              offset="0"
                              stopColor="#0C0A09"
                              stopOpacity={0.96}
                            />
                            <Stop
                              offset="0.5"
                              stopColor="#0C0A09"
                              stopOpacity={0.82}
                            />
                            <Stop
                              offset="0.78"
                              stopColor="#0C0A09"
                              stopOpacity={0.28}
                            />
                            <Stop
                              offset="1"
                              stopColor="#0C0A09"
                              stopOpacity={0}
                            />
                          </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#hero)" />
                      </Svg>
                      <Stack padding={24} gap={8} style={{ maxWidth: "68%" }}>
                        <Stack
                          backgroundColor="rgba(255,255,255,0.16)"
                          borderRadius={999}
                          paddingHorizontal={12}
                          paddingVertical={5}
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
                          fontSize={23}
                          fontWeight="800"
                          lineHeight={28}
                          style={{ letterSpacing: -0.4 }}
                        >
                          <StyledText
                            fontSize={23}
                            fontWeight="800"
                            color="#FFFFFF"
                          >
                            {slide.titleLead}
                          </StyledText>
                          <StyledText
                            fontSize={23}
                            fontWeight="800"
                            color={COLORS.primary}
                          >
                            {slide.titleHighlight}
                          </StyledText>
                        </StyledText>
                        <StyledText
                          fontSize={13}
                          color="rgba(255,255,255,0.82)"
                        >
                          {slide.subtitle}
                        </StyledText>
                        <Stack
                          horizontal
                          alignItems="center"
                          gap={6}
                          backgroundColor={COLORS.primary}
                          borderRadius={999}
                          paddingHorizontal={20}
                          paddingVertical={11}
                          alignSelf="flex-start"
                          marginTop={6}
                          style={SHADOW_CTA}
                        >
                          <StyledText
                            fontSize={13.5}
                            fontWeight="700"
                            color="#FFFFFF"
                          >
                            {slide.cta}
                          </StyledText>
                          <Icon name="arrow-right" size={14} color="#FFFFFF" />
                        </Stack>
                      </Stack>
                    </StyledImageBackground>
                  </ScalePressable>
                </Stack>
              ))}
            </ScrollView>
          </Stack>

          <Stack
            horizontal
            justifyContent="center"
            alignItems="center"
            gap={6}
            marginTop={14}
            marginBottom={28}
          >
            {SLIDES.map((_, i) => (
              <Stack
                key={i}
                width={i === slideIndex ? 22 : 6}
                height={6}
                borderRadius={3}
                backgroundColor={
                  i === slideIndex ? COLORS.primary : COLORS.border
                }
              />
            ))}
          </Stack>
        </Animated.View>

        {/* ── Platform value props ───────────────────────────────── */}
        <Animated.View style={valuePropsAnimStyle}>
          <Stack paddingHorizontal={H_PAD} marginBottom={24}>
            <Stack horizontal flexWrap="wrap" gap={14}>
              {VALUE_PROPS.map((v) => (
                <Stack
                  key={v.title}
                  width="47%"
                  backgroundColor={COLORS.bgCard}
                  borderRadius={22}
                  padding={18}
                  gap={10}
                  style={[SHADOW_CARD, { elevation: 1.5 }]}
                >
                  <StyledShape
                    size={52}
                    cycle
                    backgroundColor={COLORS.primaryLight}
                  >
                    <Icon
                      name={v.icon as any}
                      size={22}
                      color={COLORS.primary}
                    />
                  </StyledShape>
                  <StyledText
                    fontSize={14}
                    fontWeight="800"
                    color={COLORS.textPrimary}
                    style={{ letterSpacing: -0.1 }}
                  >
                    {v.title}
                  </StyledText>
                  <StyledText
                    fontSize={12.5}
                    color={COLORS.textMuted}
                    lineHeight={17}
                  >
                    {v.body}
                  </StyledText>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Animated.View>
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
