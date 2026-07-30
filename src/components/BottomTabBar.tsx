import { useRef } from "react";
import { Animated, Easing } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledPressable } from "fluent-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Tab = "home" | "order" | "search" | "addresses" | "account";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home",      label: "Home",      icon: "home"          },
  { key: "order",     label: "Orders",    icon: "shopping-bag"  },
  { key: "search",    label: "Search",    icon: "search"        },
  { key: "addresses", label: "Track",     icon: "map-pin"       },
  { key: "account",   label: "Account",   icon: "user"          },
];

const ACTIVE_BG    = "#1C1917";
const ACTIVE_ICON  = "#EA580C";
const INACTIVE_ICON = "#A8A29E";

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: typeof TABS[0];
  active: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.88, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale: anim }], flex: 1 }}>
      <StyledPressable
        onPress={handlePress}
        alignItems="center"
        justifyContent="center"
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        style={{ minHeight: 44 }}
      >
        {active ? (
          // Active — dark pill, orange icon, white label
          <Stack
            horizontal
            backgroundColor={ACTIVE_BG}
            borderRadius={999}
            marginHorizontal={-8}
            paddingHorizontal={16}
            paddingVertical={10}
            alignItems="center"
            justifyContent="center"
            gap={7}
          >
            <Icon name={tab.icon as any} size={19} color={ACTIVE_ICON} />
            {/* <StyledText fontSize={13} fontWeight="700" color="#FFFFFF">
              {tab.label}
            </StyledText> */}
          </Stack>
        ) : (
          // Inactive — icon stacked above a muted label
          <Stack
            alignItems="center"
            justifyContent="center"
            gap={3}
            paddingVertical={10}
            paddingHorizontal={8}
          >
            <Icon name={tab.icon as any} size={21} color={INACTIVE_ICON} />
            {/* <StyledText fontSize={10.5} fontWeight="600" color={INACTIVE_ICON}>
              {tab.label}
            </StyledText> */}
          </Stack>
        )}
      </StyledPressable>
    </Animated.View>
  );
}

export function BottomTabBar({ active }: { active: Tab }) {
  const insets = useSafeAreaInsets();

  function go(tab: Tab) {
    if (tab === "home")      router.replace("/results");
    if (tab === "order")     router.push("/orders");
    if (tab === "search")    router.replace("/results");
    if (tab === "addresses") router.push("/addresses");
    if (tab === "account")   router.push("/account");
  }

  return (
    <Stack
      marginHorizontal={24}
      marginBottom={Math.max(insets.bottom, 12)}
      marginTop={4}
    >
      <Stack
        horizontal
        backgroundColor="#FFFFFF"
        borderRadius={999}
   
        paddingVertical={6}
        alignItems="center"
        justifyContent="space-between"
        style={{
          shadowColor: "#1C1917",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 10,
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
