import { router } from "expo-router";
import { Stack, StyledText, StyledPressable } from "fluent-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../lib/format";
import { COLORS } from "../theme/colors";

export function BasketBar() {
  const insets = useSafeAreaInsets();
  const { itemCount, subtotalCents } = useCart();

  if (itemCount === 0) return null;

  return (
    <Stack
      position="absolute"
      left={16}
      right={16}
      bottom={insets.bottom + 12}
      zIndex={20}
    >
      <StyledPressable
        onPress={() => router.push("/basket")}
        horizontal
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
    </Stack>
  );
}
