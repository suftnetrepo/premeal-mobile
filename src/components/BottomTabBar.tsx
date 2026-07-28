import { Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledText, StyledPressable } from "fluent-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../theme/colors";

export type Tab = "home" | "order" | "search" | "addresses" | "account";

// ─── Tab definitions ──────────────────────────────────────────────────────────
// "order" is the primary CTA tab — styled differently (always has a label,
// always shows the dark active pill) to match the screenshot's centred
// "Pickup" tab which is the core action of the app.
const TABS: { key: Tab; label: string; icon: string; primary?: boolean }[] = [
  { key: "home",      label: "Home",      icon: "home"       },
  { key: "order",     label: "Order",     icon: "shopping-bag", primary: true },
  { key: "search",    label: "Search",    icon: "search"     },
  { key: "addresses", label: "Addresses", icon: "map-pin"    },
  { key: "account",   label: "Account",   icon: "user"       },
];

// Amber/gold pill background — matches the screenshot's warm golden container.
// Distinct from Pre-Meal's orange primary so the tab bar reads as a separate
// UI layer, not a duplicate of buttons elsewhere on screen.
const TAB_BG   = "#F5A623";
const TAB_ICON = "#7A4F00"; // dark amber for inactive icons

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: typeof TABS[0];
  active: boolean;
  onPress: () => void;
}) {
  const isPrimary = !!tab.primary;
  const showActive = active || isPrimary;

  // Subtle scale animation on press
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <StyledPressable onPress={handlePress} alignItems="center" gap={0} paddingHorizontal={4}>
        {showActive ? (
          // Dark pill — active state or primary tab
          <Stack
            horizontal
            backgroundColor="#1C1917"
            borderRadius={999}
            paddingHorizontal={16}
            paddingVertical={8}
            alignItems="center"
            justifyContent="center"
            gap={7}
          >
            <Icon name={tab.icon as any} size={18} color="#FFFFFF" />
            <StyledText fontSize={13} fontWeight="700" color="#FFFFFF">
              {tab.label}
            </StyledText>
          </Stack>
        ) : (
          // Icon only — inactive
          <Stack
            width={44}
            height={40}
            alignItems="center"
            justifyContent="center"
          >
            <Icon name={tab.icon as any} size={22} color={TAB_ICON} />
          </Stack>
        )}
      </StyledPressable>
    </Animated.View>
  );
}

export function BottomTabBar({ active }: { active: Tab }) {
  const insets = useSafeAreaInsets();

  function go(tab: Tab) {
    if (tab === "home")      router.push("/");
    if (tab === "order")     router.push("/");          // takes them to browse restaurants
    if (tab === "search")    router.push("/");          // future: search screen
    if (tab === "addresses") router.push("/addresses");
    if (tab === "account")   router.push("/account");
  }

  return (
    // Floating pill container — shadow gives it the lifted look from the screenshot
    <Stack
      paddingHorizontal={16}
      paddingBottom={insets.bottom || 16}
      paddingTop={8}
    >
      <Stack
        horizontal
        backgroundColor={TAB_BG}
        borderRadius={999}
        paddingHorizontal={8}
        paddingVertical={8}
        alignItems="center"
        justifyContent="space-between"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            active={active === tab.key}
            onPress={() => go(tab.key)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
