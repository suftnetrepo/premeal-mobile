import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledPressable, StyledImageBackground } from "fluent-styles";
import { Text } from "./text";
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
          <Text fontSize={52}>{cuisineEmoji(item.cuisine)}</Text>
        </Stack>
      )}
      <Stack paddingTop={12} gap={4}>
        <Text fontSize={17} fontWeight="800" color={COLORS.textPrimary}>
          {item.name}
        </Text>
        <Stack horizontal alignItems="center" gap={5}>
          {item.averageRating !== null ? (
            <>
              <Icon name="star" size={13} color="#F59E0B" />
              <Text fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
                {item.averageRating.toFixed(1)}
              </Text>
              <Text fontSize={13} color={COLORS.textMuted}>
                ({item.reviewCount} ratings) · {item.cuisine}
              </Text>
            </>
          ) : (
            <Text fontSize={13} color={COLORS.textMuted}>New · {item.cuisine}</Text>
          )}
        </Stack>
        <Stack horizontal alignItems="center" gap={8} flexWrap="wrap" marginTop={2}>
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="truck" size={11} color={COLORS.textMuted} />
            <Text variant="bodySmall" color={COLORS.textMuted}>
              {item.deliveryFeeCents === 0 ? "Free delivery" : `${formatMoney(item.deliveryFeeCents)} delivery`}
            </Text>
          </Stack>
          <Text variant="bodySmall" color={COLORS.border}>·</Text>
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="shopping-cart" size={11} color={COLORS.textMuted} />
            <Text variant="bodySmall" color={COLORS.textMuted}>
              {item.minOrderCents === 0 ? "No min. order" : `Min. ${formatMoney(item.minOrderCents)}`}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </StyledPressable>
  );
}
