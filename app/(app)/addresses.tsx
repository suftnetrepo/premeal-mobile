import { useRef, useState } from "react";
import { ActivityIndicator, Animated, ScrollView } from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  Stack,
  StyledText,
  StyledShape,
  StyledBadge,
  StyledTextInput,
  actionSheetService,
  type StyledTextInputHandle,
} from "fluent-styles";
import {
  useAddresses,
  useCreateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from "../../src/hooks/useAddresses";
import { useAddressSuggestions } from "../../src/hooks/useGeocode";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD, SHADOW_CTA } from "../../src/lib/animations";
import type { Address } from "../../src/api/types";
import type { GeocodeSuggestion } from "../../src/api/geocode";

const H_PAD = 20;

function addressIcon(label: string | null | undefined): { name: string; bg: string; color: string } {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return { name: "home", bg: COLORS.primaryLight, color: COLORS.primary };
  if (l === "work") return { name: "briefcase", bg: "#EFF6FF", color: "#1D4ED8" };
  if (l === "favourite" || l === "favorite") return { name: "heart", bg: "#FEF2F2", color: "#DC2626" };
  return { name: "map-pin", bg: COLORS.bgMuted, color: COLORS.textMuted };
}

// ─── Saved address card ─────────────────────────────────────────────────────────
function AddressCard({
  addr,
  onSetDefault,
  onDelete,
}: {
  addr: Address;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const ico = addressIcon(addr.label);

  function openMenu() {
    actionSheetService.show({
      title: addr.label ?? "Address",
      items: [
        ...(addr.isDefault
          ? []
          : [{ icon: "⭐", label: "Set as default", onPress: onSetDefault }]),
        { icon: "🗑️", label: "Delete address", variant: "destructive" as const, onPress: onDelete },
      ],
    });
  }

  return (
    <Stack
      horizontal
      alignItems="center"
      gap={14}
      backgroundColor={COLORS.bgCard}
      borderRadius={26}
      padding={18}
      marginBottom={16}
      style={SHADOW_CARD}
    >
      <StyledShape size={52} cycle backgroundColor={ico.bg}>
        <Icon name={ico.name as any} size={22} color={ico.color} />
      </StyledShape>

      <Stack flex={1} gap={3}>
        <Stack horizontal alignItems="center" gap={8}>
          <StyledText fontSize={15.5} fontWeight="800" color={COLORS.textPrimary}>
            {addr.label ?? "Address"}
          </StyledText>
          {addr.isDefault && (
            <StyledBadge
              backgroundColor={COLORS.primaryLight}
              color={COLORS.primary}
              paddingHorizontal={9}
              paddingVertical={3}
              borderRadius={999}
              fontSize={10.5}
              fontWeight="700"
            >
              Default
            </StyledBadge>
          )}
        </Stack>
        <StyledText fontSize={13} color={COLORS.textMuted} numberOfLines={2}>
          {addr.address}
        </StyledText>
      </Stack>

      <ScalePressable onPress={openMenu} toValue={0.85}>
        <Stack width={36} height={36} alignItems="center" justifyContent="center">
          <Icon name="more-vertical" size={19} color={COLORS.textMuted} />
        </Stack>
      </ScalePressable>
    </Stack>
  );
}

// ─── Autocomplete suggestion row — same GeocodeSuggestion shape used by
// AddressPickerPopup, just split at the first comma for a two-line look. ──────
function SuggestionRow({ s, onPress }: { s: GeocodeSuggestion; onPress: () => void }) {
  const commaIndex = s.formattedAddress.indexOf(",");
  const main = commaIndex === -1 ? s.formattedAddress : s.formattedAddress.slice(0, commaIndex);
  const secondary = commaIndex === -1 ? "" : s.formattedAddress.slice(commaIndex + 1).trim();

  return (
    <ScalePressable onPress={onPress} toValue={0.98}>
      <Stack horizontal alignItems="center" gap={14} paddingVertical={14} paddingHorizontal={18}>
        <StyledShape size={38} cycle backgroundColor={COLORS.bgMuted}>
          <Icon name="map-pin" size={16} color={COLORS.textMuted} />
        </StyledShape>
        <Stack flex={1} gap={2}>
          <StyledText fontSize={14.5} fontWeight="700" color={COLORS.textPrimary} numberOfLines={1}>
            {main}
          </StyledText>
          {secondary.length > 0 && (
            <StyledText fontSize={12.5} color={COLORS.textMuted} numberOfLines={1}>
              {secondary}
            </StyledText>
          )}
        </Stack>
      </Stack>
    </ScalePressable>
  );
}

// ─── Suggestion list — a distinct component (not inline conditional JSX) so
// its mount-fade hook re-fires cleanly each time it's freshly keyed in. ───────
function SuggestionsList({
  suggestions,
  onSelect,
}: {
  suggestions: GeocodeSuggestion[];
  onSelect: (s: GeocodeSuggestion) => void;
}) {
  const anim = useFadeUp(0);
  return (
    <Animated.View style={anim}>
      <Stack backgroundColor={COLORS.bgCard} borderRadius={22} overflow="hidden" style={SHADOW_CARD}>
        {suggestions.map((s, i) => (
          <Stack key={`${s.latitude},${s.longitude}`}>
            {i > 0 && <Stack height={1} backgroundColor={COLORS.border} marginHorizontal={18} />}
            <SuggestionRow s={s} onPress={() => onSelect(s)} />
          </Stack>
        ))}
      </Stack>
    </Animated.View>
  );
}

export default function AddressesScreen() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const deleteAddress = useDeleteAddress();

  const [query, setQuery] = useState("");
  const { data: suggestions, isFetching: suggestionsLoading } = useAddressSuggestions(query);
  const searchRef = useRef<StyledTextInputHandle>(null);

  const listAnim = useFadeUp(0);
  const hasAddresses = (addresses ?? []).length > 0;
  const hasSuggestions = (suggestions ?? []).length > 0;

  function handleSelectSuggestion(s: GeocodeSuggestion) {
    createAddress.mutate({ address: s.formattedAddress }, { onSuccess: () => setQuery("") });
  }

  function handleAddManually() {
    if (!query.trim()) return;
    createAddress.mutate({ address: query.trim() }, { onSuccess: () => setQuery("") });
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Stack paddingHorizontal={H_PAD} paddingTop={8} gap={4}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <ScalePressable onPress={() => router.back()} toValue={0.88}>
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                alignItems="center"
                justifyContent="center"
                backgroundColor="#FFFFFF"
                style={SHADOW_SOFT}
              >
                <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
              </Stack>
            </ScalePressable>
            <StyledText fontSize={18} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.2 }}>
              Addresses
            </StyledText>
            <ScalePressable onPress={() => searchRef.current?.focus()} toValue={0.88}>
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                alignItems="center"
                justifyContent="center"
                backgroundColor="#FFFFFF"
                style={SHADOW_SOFT}
              >
                <Icon name="plus" size={19} color={COLORS.primary} />
              </Stack>
            </ScalePressable>
          </Stack>
          <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
            Choose a delivery address
          </StyledText>
        </Stack>
      </StyledPage.Header.Full>

      <ScrollView contentContainerStyle={{ padding: H_PAD, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <StyledTextInput
          ref={searchRef}
          variant="outline"
          size="lg"
          placeholder="Search for your address"
          value={query}
          onChangeText={setQuery}
          clearable
          focusColor={COLORS.primary}
          leftIcon={<Icon name="search" size={17} color={COLORS.textMuted} />}
        />

        {query.trim().length >= 3 && (
          <Stack marginTop={12}>
            {suggestionsLoading && (
              <Stack paddingVertical={16} alignItems="center">
                <ActivityIndicator color={COLORS.primary} />
              </Stack>
            )}

            {!suggestionsLoading && hasSuggestions && (
              <SuggestionsList
                key={suggestions![0]?.formattedAddress}
                suggestions={suggestions!}
                onSelect={handleSelectSuggestion}
              />
            )}

            {!suggestionsLoading && !hasSuggestions && (
              <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center" paddingVertical={12}>
                No addresses found — try a different search.
              </StyledText>
            )}
          </Stack>
        )}

        {isLoading ? (
          <Stack alignItems="center" paddingTop={60}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </Stack>
        ) : (
          <Animated.View style={listAnim}>
            {hasAddresses ? (
              <Stack marginTop={24}>
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={COLORS.textMuted}
                  marginBottom={14}
                  style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Saved addresses
                </StyledText>
                {addresses!.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    addr={addr}
                    onSetDefault={() => setDefaultAddress.mutate(addr.id)}
                    onDelete={() => deleteAddress.mutate(addr.id)}
                  />
                ))}
              </Stack>
            ) : (
              query.trim().length < 3 && (
                <Stack alignItems="center" paddingTop={48} paddingHorizontal={24} gap={12}>
                  <StyledShape size={88} cycle backgroundColor={COLORS.primaryLight}>
                    <Icon name="map-pin" size={34} color={COLORS.primary} />
                  </StyledShape>
                  <StyledText fontSize={17} fontWeight="800" color={COLORS.textPrimary} textAlign="center">
                    No saved addresses
                  </StyledText>
                  <StyledText fontSize={13.5} color={COLORS.textMuted} textAlign="center">
                    Search above or add your first delivery address.
                  </StyledText>
                </Stack>
              )
            )}
          </Animated.View>
        )}

        <ScalePressable onPress={handleAddManually} disabled={!query.trim() || createAddress.isPending} toValue={0.97}>
          <Stack
            marginTop={hasAddresses ? 8 : 32}
            alignItems="center"
            justifyContent="center"
            paddingVertical={17}
            borderRadius={999}
            backgroundColor={query.trim() ? COLORS.primary : COLORS.bgMuted}
            style={query.trim() ? SHADOW_CTA : undefined}
          >
            {createAddress.isPending ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Stack horizontal alignItems="center" gap={8}>
                <Icon name="plus" size={17} color={query.trim() ? COLORS.white : COLORS.textMuted} />
                <StyledText fontSize={15.5} fontWeight="700" color={query.trim() ? COLORS.white : COLORS.textMuted}>
                  Add address manually
                </StyledText>
              </Stack>
            )}
          </Stack>
        </ScalePressable>
      </ScrollView>
    </StyledPage>
  );
}
