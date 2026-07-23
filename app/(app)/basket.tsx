import { ScrollView } from "react-native";
import { router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable, StyledCard, dialogueService } from "fluent-styles";
import { useCart } from "../../src/cart/CartContext";
import { formatMoney } from "../../src/lib/format";
import { summarizeSelection } from "../../src/cart/cart-utils";
import { COLORS } from "../../src/theme/colors";

export default function BasketScreen() {
  const cart = useCart();

  async function handleClear() {
    const confirmed = await dialogueService.confirm({
      title: "Clear basket?",
      message: "This removes everything you've added so far.",
      confirmLabel: "Clear",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (confirmed) cart.clearCart();
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader
        title="Your basket"
        titleAlignment="center"
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={COLORS.bgCard}
        showStatusBar statusBarProps={{ barStyle: "dark-content" }}
        borderBottomWidth={0.5}
        borderBottomColor={COLORS.border}
      />

      {cart.lines.length === 0 ? (
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32} gap={12}>
          <StyledText fontSize={48}>🛒</StyledText>
          <StyledText fontSize={17} fontWeight="700" color={COLORS.textPrimary} textAlign="center">Your basket is empty</StyledText>
          <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">Add something from a restaurant to get started.</StyledText>
          <StyledPressable onPress={() => router.replace("/")} marginTop={12} paddingHorizontal={28} paddingVertical={14} borderRadius={999} backgroundColor={COLORS.primary}>
            <StyledText fontSize={15} fontWeight="700" color={COLORS.white}>Browse restaurants</StyledText>
          </StyledPressable>
        </Stack>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            <StyledText fontSize={12} fontWeight="700" color={COLORS.textMuted} marginBottom={12} style={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
              {cart.restaurantName}
            </StyledText>

            <Stack gap={10}>
              {cart.lines.map((line) => {
                const modifiers = summarizeSelection(line.menuItem, line.selectedOptionIds);
                return (
                  <StyledCard key={line.cartItemId} shadow="light" borderRadius={16} padding={14} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border}>
                    <Stack horizontal justifyContent="space-between" gap={12}>
                      <Stack flex={1} gap={4}>
                        <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>{line.menuItem.name}</StyledText>
                        {modifiers.length > 0 && <StyledText fontSize={12} color={COLORS.textMuted}>{modifiers}</StyledText>}
                        <StyledPressable onPress={() => cart.removeLine(line.cartItemId)} paddingTop={2} alignSelf="flex-start">
                          <StyledText fontSize={12} fontWeight="600" color={COLORS.error}>Remove</StyledText>
                        </StyledPressable>
                      </Stack>
                      <Stack alignItems="flex-end" gap={10}>
                        <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                          {formatMoney(line.unitPriceCents * line.quantity)}
                        </StyledText>
                        <Stack horizontal alignItems="center" gap={10}>
                          <StyledPressable onPress={() => cart.updateQuantity(line.cartItemId, line.quantity - 1)} width={30} height={30} borderRadius={15} alignItems="center" justifyContent="center" backgroundColor={COLORS.bgMuted}>
                            <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>−</StyledText>
                          </StyledPressable>
                          <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>{line.quantity}</StyledText>
                          <StyledPressable onPress={() => cart.updateQuantity(line.cartItemId, line.quantity + 1)} width={30} height={30} borderRadius={15} alignItems="center" justifyContent="center" backgroundColor={COLORS.bgMuted}>
                            <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>+</StyledText>
                          </StyledPressable>
                        </Stack>
                      </Stack>
                    </Stack>
                  </StyledCard>
                );
              })}
            </Stack>

            <StyledPressable onPress={handleClear} alignItems="center" paddingVertical={16} marginTop={4}>
              <StyledText fontSize={13} fontWeight="600" color={COLORS.error}>Clear basket</StyledText>
            </StyledPressable>
          </ScrollView>

          <Stack backgroundColor={COLORS.bgCard} borderTopWidth={0.5} borderTopColor={COLORS.border} padding={16} gap={12}>
            <Stack horizontal justifyContent="space-between">
              <StyledText fontSize={15} color={COLORS.textSecondary}>Subtotal</StyledText>
              <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>{formatMoney(cart.subtotalCents)}</StyledText>
            </Stack>
            <StyledText fontSize={12} color={COLORS.textMuted}>Delivery fee and total confirmed at checkout.</StyledText>
            <StyledPressable onPress={() => router.push("/checkout")} paddingVertical={17} borderRadius={999} backgroundColor={COLORS.primary} alignItems="center">
              <StyledText fontSize={16} fontWeight="700" color={COLORS.white}>Go to checkout</StyledText>
            </StyledPressable>
          </Stack>
        </>
      )}
    </StyledPage>
  );
}
