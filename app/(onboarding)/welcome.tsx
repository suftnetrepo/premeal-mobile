import { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, StyledText, StyledPressable } from "fluent-styles";
import { useOnboarding } from "../../src/onboarding/OnboardingContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.58);

// ─── Brand tokens — lifted from premeal-app/src/app/globals.css + the
// Tailwind classes actually used on the homepage (orange-600 / stone-*),
// so the mobile app reads as the same brand, not a reskin. ───────────────────
const PRIMARY = "#EA580C"; // orange-600
const STONE_900 = "#1C1917";
const STONE_600 = "#57534E";
const STONE_500 = "#78716C";
const STONE_200 = "#E7E5E4";

interface TitleLine {
  text: string;
  accent?: boolean;
}

interface Slide {
  key: string;
  imageSeed: string;
  eyebrow?: string;
  titleLines: TitleLine[];
  subtitle: string;
}

// Copy is pulled directly from premeal-app's homepage (hero line + the four
// "how it works" value props), not invented for this screen — same claims,
// same order, so mobile onboarding and the web app never say different
// things about what Pre-Meal actually does.
const SLIDES: Slide[] = [
  {
    key: "hero",
    imageSeed: "premeal-onboard-1",
    eyebrow: "SCHEDULE AHEAD · EAT ON TIME",
    titleLines: [
      { text: "Fresh food." },
      { text: "Delivered exactly" },
      { text: "when you want it.", accent: true },
    ],
    subtitle:
      "Pick a restaurant, choose your delivery window, and we'll confirm within 30 minutes.",
  },
  {
    key: "schedule",
    imageSeed: "premeal-onboard-2",
    titleLines: [{ text: "Schedule," }, { text: "not rush.", accent: true }],
    subtitle:
      "Book your delivery slot days ahead — no rushing to catch a driver at the door.",
  },
  {
    key: "confirmed",
    imageSeed: "premeal-onboard-3",
    titleLines: [{ text: "Confirmed" }, { text: "fast.", accent: true }],
    subtitle:
      "Restaurants respond within 30 minutes, so you're never left guessing if your order's on.",
  },
  {
    key: "fair",
    imageSeed: "premeal-onboard-4",
    titleLines: [{ text: "Fair," }, { text: "transparent pricing.", accent: true }],
    subtitle:
      "You pay exactly what the restaurant charges — no markup games, no surprise fees.",
  },
  {
    key: "reviews",
    imageSeed: "premeal-onboard-5",
    titleLines: [{ text: "Reviews you" }, { text: "can actually trust.", accent: true }],
    subtitle:
      "Every review comes from an order that was actually delivered. Nothing fake, nothing paid for.",
  },
];

// ─── One hero photo + copy pane ────────────────────────────────────────────────
function SlidePane({ slide }: { slide: Slide }) {
  return (
    <Stack width={SCREEN_WIDTH}>
      <ImageBackground
        // TEMP — same placeholder approach as premeal-app/src/app/page.tsx
        // (seeded picsum.photos, so it's stable across reloads rather than
        // random). Swap for real licensed food photography before launch —
        // see the note at the end of this response for exact specs.
        source={{ uri: `https://picsum.photos/seed/${slide.imageSeed}/1200/1600` }}
        style={{ height: HERO_HEIGHT, width: SCREEN_WIDTH }}
        resizeMode="cover"
      >
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={130}
          backgroundColor="rgba(0,0,0,0.22)"
        />
        {slide.eyebrow && (
          <Stack position="absolute" top={64} left={24} right={80}>
            <StyledText
              fontSize={11}
              fontWeight="700"
              color="#FFFFFF"
              style={{ letterSpacing: 1.5 }}
            >
              {slide.eyebrow}
            </StyledText>
          </Stack>
        )}
      </ImageBackground>

      <Stack
        flex={1}
        marginTop={-24}
        backgroundColor="#FFFFFF"
        borderTopLeftRadius={28}
        borderTopRightRadius={28}
        paddingTop={32}
        paddingHorizontal={28}
        alignItems="center"
      >
        <Stack alignItems="center" gap={2}>
          {slide.titleLines.map((line, i) => (
            <StyledText
              key={i}
              fontSize={26}
              fontWeight="800"
              lineHeight={32}
              textAlign="center"
              color={line.accent ? PRIMARY : STONE_900}
              style={{ letterSpacing: -0.3 }}
            >
              {line.text}
            </StyledText>
          ))}
        </Stack>
        <Stack height={14} />
        <StyledText fontSize={15} lineHeight={22} color={STONE_600} textAlign="center">
          {slide.subtitle}
        </StyledText>
      </Stack>
    </Stack>
  );
}

export default function OnboardingWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { complete } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goToIndex = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    setIndex(next);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (next !== index) setIndex(next);
  };

  const finishOnboarding = async () => {
    await complete();
    router.replace("/");
  };

  const handlePrimaryPress = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      goToIndex(index + 1);
    }
  };

  return (
    <Stack flex={1} backgroundColor="#FFFFFF">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {SLIDES.map((slide) => (
          <SlidePane key={slide.key} slide={slide} />
        ))}
      </ScrollView>

      {!isLast && (
        <StyledPressable
          position="absolute"
          top={insets.top + 12}
          right={20}
          zIndex={10}
          paddingHorizontal={16}
          paddingVertical={9}
          borderRadius={999}
          backgroundColor="rgba(255,255,255,0.24)"
          onPress={finishOnboarding}
        >
          <StyledText fontSize={13} fontWeight="600" color="#FFFFFF">
            Skip
          </StyledText>
        </StyledPressable>
      )}

      <Stack
        backgroundColor="#FFFFFF"
        borderTopWidth={1}
        borderTopColor={STONE_200}
        paddingHorizontal={28}
        paddingTop={18}
        paddingBottom={insets.bottom + 18}
        gap={18}
      >
        <Stack horizontal alignItems="center" justifyContent="center" gap={6}>
          {SLIDES.map((slide, i) => (
            <Stack
              key={slide.key}
              width={i === index ? 22 : 7}
              height={7}
              borderRadius={4}
              backgroundColor={i === index ? PRIMARY : STONE_200}
            />
          ))}
        </Stack>

        <StyledPressable
          onPress={handlePrimaryPress}
          backgroundColor={PRIMARY}
          borderRadius={999}
          paddingVertical={17}
          alignItems="center"
          justifyContent="center"
          style={{
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <StyledText fontSize={16} fontWeight="700" color="#FFFFFF">
            {isLast ? "Get Started" : "Next"}
          </StyledText>
        </StyledPressable>

        {isLast && (
          <StyledPressable
            alignItems="center"
            justifyContent="center"
            paddingVertical={4}
            onPress={async () => {
              await complete();
              router.replace("/login");
            }}
          >
            <StyledText fontSize={14} color={STONE_500}>
              Already have an account?{" "}
              <StyledText fontSize={14} fontWeight="700" color={PRIMARY}>
                Log in
              </StyledText>
            </StyledText>
          </StyledPressable>
        )}
      </Stack>
    </Stack>
  );
}
