import { useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, StyledText, StyledPressable, Stack, theme } from "fluent-styles";
import { useLocation } from "../../src/location/LocationContext";
import { useRestaurants } from "../../src/hooks/useRestaurants";
import { useCart } from "../../src/cart/CartContext";
import { BasketBar } from "../../src/components/BasketBar";
import { BottomTabBar } from "../../src/components/BottomTabBar";
import { AddressPickerPopup } from "../../src/components/AddressPickerPopup";
import { RestaurantCard } from "../../src/components/RestaurantCard";
import { SUPPORTED_CUISINES } from "../../src/lib/cuisines";
import { COLORS } from "../../src/theme/colors";

const H_PAD = 16;

function addressIconName(label: string | null | undefined): string {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home";
  if (l === "work") return "briefcase";
  return "map-pin";
}

export default function ResultsScreen() {
  const { active, setActive } = useLocation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const cart = useCart();

  const { data: restaurants, isLoading, error } = useRestaurants(
    active ? { lat: active.lat, lng: active.lng } : undefined
  );

  const filtered = cuisineFilter ? (restaurants ?? []).filter((r) => r.cuisine === cuisineFilter) : restaurants ?? [];

  // Discover always sets a location before navigating here — this is a
  // defensive fallback, not the expected path, for something like a deep
  // link landing directly on /results.
  if (!active) {
    return (
      <StyledPage flex={1} backgroundColor="#F8F8F8" alignItems="center" justifyContent="center" padding={24}>
        <StyledText fontSize={15} color={COLORS.textMuted} textAlign="center" marginBottom={16}>
          Set a delivery address to see restaurants.
        </StyledText>
        <StyledPressable onPress={() => router.replace("/")} backgroundColor={COLORS.primary} borderRadius={999} paddingHorizontal={20} paddingVertical={12}>
          <StyledText fontSize={14} fontWeight="700" color="#FFFFFF">Set address</StyledText>
        </StyledPressable>
      </StyledPage>
    );
  }

  return (
    <StyledPage showStatusBar backgroundColor={theme.colors.gray[1]}>
      <StyledPage.Header.Full>
        <Stack vertical flex={1} paddingHorizontal={H_PAD} paddingTop={6} paddingBottom={14} gap={12}>
          <StyledPressable onPress={() => setPickerOpen(true)} flexDirection="row" alignItems="center" gap={6}>
              <Icon name={addressIconName(active.label) as any} size={13} color={COLORS.primary} />
              <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary} numberOfLines={1} flex={1}>
                {active.formattedAddress}
              </StyledText>
              <StyledText fontSize={12} fontWeight="700" color={COLORS.primary}>Change</StyledText>
            </StyledPressable>

            <Stack flexDirection="row" alignItems="center" gap={10}
              borderWidth={1} borderColor={COLORS.border} borderRadius={12}
              paddingHorizontal={14} paddingVertical={11} backgroundColor={COLORS.bgMuted}>
              <Icon name="search" size={15} color={COLORS.textMuted} />
              <StyledText fontSize={13} color={COLORS.textMuted}>Search by restaurant or entrée</StyledText>
            </Stack>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <StyledPressable
                onPress={() => setCuisineFilter(null)}
                flexDirection="row" alignItems="center" gap={10}
                borderRadius={999} paddingHorizontal={16} paddingVertical={9}
                backgroundColor={cuisineFilter === null ? COLORS.primary : COLORS.bgMuted}>
                <StyledText fontSize={13} fontWeight="700" color={cuisineFilter === null ? "#FFFFFF" : COLORS.textSecondary}>
                  All
                </StyledText>
              </StyledPressable>
              {SUPPORTED_CUISINES.map((c) => (
                <StyledPressable
                  key={c}
                  onPress={() => setCuisineFilter(cuisineFilter === c ? null : c)}
                  borderRadius={999} paddingHorizontal={16} paddingVertical={9}
                  flexDirection="row"
                  backgroundColor={cuisineFilter === c ? COLORS.primary : COLORS.bgMuted}>
                  <StyledText fontSize={13} fontWeight="700" color={cuisineFilter === c ? "#FFFFFF" : COLORS.textSecondary}>
                    {c}
                  </StyledText>
                </StyledPressable>
              ))}
            </ScrollView>
          </Stack>
      
      </StyledPage.Header.Full>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: H_PAD, paddingBottom: 24 }}>
        <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={14}>
          <StyledText fontSize={19} fontWeight="800" color={COLORS.textPrimary}>Near you</StyledText>
          {!isLoading && !error && <StyledText fontSize={13} color={COLORS.textMuted}>{filtered.length} places</StyledText>}
        </Stack>

        {isLoading && (
          <Stack alignItems="center" paddingVertical={40}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </Stack>
        )}

        {error && (
          <Stack padding={14} borderRadius={12} backgroundColor={COLORS.errorLight}>
            <StyledText fontSize={14} color={COLORS.error}>Could not load restaurants. Check your connection.</StyledText>
          </Stack>
        )}

        {!isLoading && !error && filtered.length === 0 && (restaurants ?? []).length > 0 && (
          <Stack alignItems="center" paddingVertical={32} gap={8}>
            <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">
              No {cuisineFilter} restaurants deliver here yet.
            </StyledText>
            <StyledPressable onPress={() => setCuisineFilter(null)}>
              <StyledText fontSize={13} fontWeight="700" color={COLORS.primary}>Browse all cuisines</StyledText>
            </StyledPressable>
          </Stack>
        )}

        {!isLoading && !error && (restaurants ?? []).length === 0 && (
          <Stack alignItems="center" paddingVertical={32} gap={8}>
            <Icon name="map-pin" size={28} color={COLORS.border} />
            <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary} textAlign="center">
              No restaurants deliver here yet
            </StyledText>
            <StyledText fontSize={13} color={COLORS.textMuted} textAlign="center">
              We don't have partners that cover this area. Try a nearby town or city.
            </StyledText>
            <StyledPressable onPress={() => setPickerOpen(true)} marginTop={4}>
              <StyledText fontSize={13} fontWeight="700" color={COLORS.primary}>Try a different address →</StyledText>
            </StyledPressable>
          </Stack>
        )}

        {filtered.map((item) => (
          <RestaurantCard key={item.id} item={item} onPress={() => router.push(`/restaurant/${item.id}`)} />
        ))}
      </ScrollView>

      {cart.itemCount > 0 && <BasketBar />}
      <BottomTabBar active="home" />

      <AddressPickerPopup
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        activeAddressId={active.addressId}
        onLocationSelected={setActive}
      />
    </StyledPage>
  );
}
