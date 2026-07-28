import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledText, StyledPressable, StyledImageBackground } from "fluent-styles";
import { formatMoney } from "../lib/format";
import { cuisineEmoji } from "../lib/cuisines";
import { COLORS } from "../theme/colors";
import type { Restaurant } from "../api/types";

export function RestaurantCard({ item, onPress }: { item: Restaurant; onPress: () => void }) {
  return (
    <StyledPressable
      onPress={onPress}
      marginBottom={20}
      borderRadius={18}
      overflow="hidden"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }}
    >
      {item.imageUrl ? (
        <StyledImageBackground source={{ uri: item.imageUrl }} height={200} resizeMode="cover" />
      ) : (
        // No stock-photo fallback here on purpose — a random Unsplash
        // image with no thematic control was tried, then reverted, on
        // the web homepage and once already on mobile. An honest
        // "no real photo yet" placeholder beats pretending one exists.
        <Stack height={200} backgroundColor={COLORS.primaryLight} alignItems="center" justifyContent="center">
          <StyledText fontSize={52}>{cuisineEmoji(item.cuisine)}</StyledText>
        </Stack>
      )}
      <Stack paddingTop={12} gap={4}>
        <StyledText fontSize={17} fontWeight="800" color={COLORS.textPrimary}>
          {item.name}
        </StyledText>
        <Stack horizontal alignItems="center" gap={5}>
          {item.averageRating !== null ? (
            <>
              <Icon name="star" size={13} color="#F59E0B" />
              <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
                {item.averageRating.toFixed(1)}
              </StyledText>
              <StyledText fontSize={13} color={COLORS.textMuted}>
                ({item.reviewCount} ratings) · {item.cuisine}
              </StyledText>
            </>
          ) : (
            <StyledText fontSize={13} color={COLORS.textMuted}>New · {item.cuisine}</StyledText>
          )}
        </Stack>
        <Stack horizontal alignItems="center" gap={8} flexWrap="wrap" marginTop={2}>
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="truck" size={11} color={COLORS.textMuted} />
            <StyledText fontSize={12} color={COLORS.textMuted}>
              {item.deliveryFeeCents === 0 ? "Free delivery" : `${formatMoney(item.deliveryFeeCents)} delivery`}
            </StyledText>
          </Stack>
          <StyledText fontSize={12} color={COLORS.border}>·</StyledText>
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="shopping-cart" size={11} color={COLORS.textMuted} />
            <StyledText fontSize={12} color={COLORS.textMuted}>
              {item.minOrderCents === 0 ? "No min. order" : `Min. ${formatMoney(item.minOrderCents)}`}
            </StyledText>
          </Stack>
        </Stack>
      </Stack>
    </StyledPressable>
  );
}
