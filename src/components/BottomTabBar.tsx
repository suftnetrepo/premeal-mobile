import { Animated, Easing } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledText, StyledPressable } from "fluent-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../theme/colors";

export type Tab = "home" | "order" | "search" | "addresses" | "account";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home",      label: "Home",      icon: "home"          },
  { key: "order",     label: "Order",     icon: "shopping-bag"  },
  { key: "search",    label: "Search",    icon: "search"        },
  { key: "addresses", label: "Addresses", icon: "map-pin"       },
  { key: "account",   label: "Account",   icon: "user"          },
];

const TAB_BG   = "#F5A623";
const TAB_ICON = "#7A4F00";

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: typeof TABS[0];
  active: boolean;
  onPress: () => void;
}) {
  const anim = new Animated.Value(1);

  function handlePress() {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.88, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale: anim }] }}>
      <StyledPressable onPress={handlePress} alignItems="center" paddingHorizontal={4}>
        {active ? (
          // Active — dark pill with icon + label
          <Stack
            horizontal
            backgroundColor="#1C1917"
            borderRadius={999}
            paddingHorizontal={16}
            paddingVertical={9}
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
          // Inactive — icon only, no background, no label
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
    if (tab === "order")     router.push("/");
    if (tab === "search")    router.push("/");
    if (tab === "addresses") router.push("/addresses");
    if (tab === "account")   router.push("/account");
  }

  return (
    <Stack
      backgroundColor="transparent"
      paddingHorizontal={16}
      // paddingBottom accounts for the home indicator (insets.bottom) plus
      // extra breathing room so the pill sits just above the screen edge —
      // same visual gap as the screenshot.
      paddingBottom={(insets.bottom || 0) + 8}
      paddingTop={8}
    >
      <Stack
        horizontal
        backgroundColor={TAB_BG}
        borderRadius={999}
        paddingHorizontal={8}
        paddingVertical={6}
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
