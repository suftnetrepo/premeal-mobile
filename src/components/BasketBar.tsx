import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { router } from "expo-router";
import { Stack, StyledText, StyledPressable } from "fluent-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../lib/format";
import { COLORS } from "../theme/colors";

export function BasketBar() {
  const insets = useSafeAreaInsets();
  const { itemCount, subtotalCents } = useCart();
  const anim = useRef(new Animated.Value(0)).current;

  // Slides/fades in every time the bar mounts — it unmounts entirely at
  // itemCount === 0 below, so this fires fresh each time the basket goes
  // from empty to non-empty.
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  if (itemCount === 0) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: insets.bottom + 12,
        zIndex: 20,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [56, 0] }),
          },
        ],
      }}
    >
      <StyledPressable
        onPress={() => router.push("/basket")}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingVertical={16}
        borderRadius={999}
        backgroundColor={COLORS.primary}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Stack horizontal alignItems="center" gap={10}>
          <Stack
            width={24}
            height={24}
            borderRadius={12}
            backgroundColor="rgba(255,255,255,0.25)"
            alignItems="center"
            justifyContent="center"
          >
            <StyledText fontSize={12} fontWeight="800" color={COLORS.white}>
              {itemCount}
            </StyledText>
          </Stack>
          <StyledText fontSize={15} fontWeight="700" color={COLORS.white}>
            View basket
          </StyledText>
        </Stack>
        <StyledText fontSize={15} fontWeight="700" color={COLORS.white}>
          {formatMoney(subtotalCents)}
        </StyledText>
      </StyledPressable>
    </Animated.View>
  );
}
