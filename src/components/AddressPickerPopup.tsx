import { useState } from "react";
import { ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledText, StyledPressable, StyledShape, StyledBadge, StyledSpacer, Popup, toastService } from "fluent-styles";
import { useAddresses } from "../hooks/useAddresses";
import { useAddressSuggestions } from "../hooks/useGeocode";
import { locationFromAddress, type ActiveLocation } from "../location/LocationContext";
import { useOnboarding } from "../onboarding/OnboardingContext";
import { COLORS } from "../theme/colors";
import type { GeocodeSuggestion } from "../api/geocode";
import type { Address } from "../api/types";

function addressIcon(label: string | null | undefined): { name: string; bg: string; color: string } {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return { name: "home", bg: COLORS.primaryLight, color: COLORS.primary };
  if (l === "work") return { name: "briefcase", bg: "#EFF6FF", color: "#1D4ED8" };
  return { name: "map-pin", bg: COLORS.bgMuted, color: COLORS.textMuted };
}

function AddressRow({ addr, active, onSelect }: { addr: Address; active: boolean; onSelect: (addr: Address) => void }) {
  const ico = addressIcon(addr.label);
  return (
    <StyledPressable
      onPress={() => onSelect(addr)}
      flexDirection="row"
      alignItems="center"
      gap={12}
      padding={14}
      borderRadius={12}
      borderWidth={active ? 1.5 : 0.5}
      borderColor={active ? COLORS.primary : COLORS.border}
      backgroundColor={active ? COLORS.primaryLight : COLORS.bgCard}
      marginBottom={8}
    >
      <StyledShape size={36} borderRadius={10} backgroundColor={ico.bg}>
        <Icon name={ico.name as any} size={17} color={ico.color} />
      </StyledShape>
      <Stack flex={1} gap={2}>
        <Stack horizontal alignItems="center" gap={8}>
          <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
            {addr.label ?? "Address"}
          </StyledText>
          {addr.isDefault && (
            <StyledBadge
              backgroundColor={COLORS.primaryLight}
              color={COLORS.primary}
              paddingHorizontal={8}
              paddingVertical={2}
              borderRadius={999}
              fontSize={10}
              fontWeight="700"
            >
              Default
            </StyledBadge>
          )}
        </Stack>
        <StyledText fontSize={12} color={COLORS.textMuted} numberOfLines={1}>
          {addr.address}
        </StyledText>
      </Stack>
      {active && <Icon name="check-circle" size={20} color={COLORS.primary} />}
    </StyledPressable>
  );
}

export function AddressPickerPopup({
  visible,
  onClose,
  activeAddressId,
  onLocationSelected,
  initialMode = "list",
}: {
  visible: boolean;
  onClose: () => void;
  activeAddressId?: string;
  onLocationSelected: (loc: ActiveLocation) => void;
  initialMode?: "list" | "search";
}) {
  const [addingNew, setAddingNew] = useState(initialMode === "search");
  const [query, setQuery] = useState("");
  const { data: addresses } = useAddresses();
  const { reset: resetOnboarding } = useOnboarding();
  const { data: suggestions, isFetching: suggestionsLoading } = useAddressSuggestions(query);

  // If there are no saved addresses, go straight to search — don't show
  // an empty list with just an "Add new" button.
  const hasAddresses = (addresses ?? []).length > 0;
  const showSearch = addingNew || !hasAddresses;

  function handleClose() {
    // Reset to list view if addresses exist, search view if not.
    setAddingNew(initialMode === "search" || !hasAddresses);
    setQuery("");
    onClose();
  }

  async function handleSelectSavedAddress(addr: Address) {
    const loc = await locationFromAddress(addr);
    if (!loc) {
      toastService.error("Could not get location", "Try entering the address manually.");
      return;
    }
    onLocationSelected(loc);
    handleClose();
  }

  function handleSelectSuggestion(s: GeocodeSuggestion) {
    onLocationSelected({ lat: s.latitude, lng: s.longitude, formattedAddress: s.formattedAddress });
    handleClose();
  }

  return (
    <Popup
      visible={visible}
      onClose={handleClose}
      title={showSearch ? "Set delivery address" : "Choose delivery address"}
      showClose
      position="bottom"
      safeAreaBottom
    >
      {!showSearch ? (
        <Stack padding={20} gap={2}>
          {(addresses ?? []).map((addr) => (
            <AddressRow key={addr.id} addr={addr} active={activeAddressId === addr.id} onSelect={handleSelectSavedAddress} />
          ))}

          {(!addresses || addresses.length === 0) && (
            <Stack alignItems="center" paddingVertical={16} gap={6}>
              <Icon name="map-pin" size={28} color={COLORS.border} />
              <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">
                No saved addresses yet.
              </StyledText>
            </Stack>
          )}

          <StyledSpacer height={4} />

          <StyledPressable
            onPress={() => setAddingNew(true)}
            flexDirection="row"
            alignItems="center"
            gap={10}
            padding={14}
            borderRadius={12}
            borderWidth={0.5}
            borderColor={COLORS.primary}
            backgroundColor={COLORS.primaryLight}
          >
            <StyledShape size={36} cycle borderRadius={10} backgroundColor={COLORS.primary}>
              <Icon name="plus" size={18} color="#FFFFFF" />
            </StyledShape>
            <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>
              Add a new address
            </StyledText>
          </StyledPressable>

          {__DEV__ && (
            <StyledPressable onPress={resetOnboarding} alignItems="center" paddingTop={12}>
              <StyledText fontSize={11} color={COLORS.textMuted}>🛠 Reset onboarding (dev only)</StyledText>
            </StyledPressable>
          )}
        </Stack>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Stack padding={20} gap={12}>
            {(addresses ?? []).length > 0 && (
              <StyledPressable onPress={() => { setAddingNew(false); setQuery(""); }} flexDirection="row" alignItems="center" gap={6} alignSelf="flex-start">
                <Icon name="arrow-left" size={15} color={COLORS.primary} />
                <StyledText fontSize={13} fontWeight="600" color={COLORS.primary}>Back to saved</StyledText>
              </StyledPressable>
            )}

            <Stack horizontal
              alignItems="center"
              gap={10}
              borderWidth={1}
              borderColor={COLORS.border}
              borderRadius={12}
              paddingHorizontal={14}
              paddingVertical={2}
              backgroundColor={COLORS.bgCard}
            >
              <Icon name="search" size={15} color={COLORS.textMuted} />
              <TextInput
                placeholder="Start typing your address…"
                placeholderTextColor={COLORS.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                style={{ flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 12 }}
              />
              {query.length > 0 && (
                <StyledPressable onPress={() => setQuery("")} padding={4}>
                  <Icon name="x" size={15} color={COLORS.textMuted} />
                </StyledPressable>
              )}
            </Stack>

            {suggestionsLoading && <ActivityIndicator color={COLORS.primary} />}

            {suggestions && suggestions.length > 0 && (
              <Stack borderWidth={0.5} borderColor={COLORS.border} borderRadius={12} backgroundColor={COLORS.bgCard} overflow="hidden">
                {suggestions.map((s: GeocodeSuggestion) => (
                  <StyledPressable
                    key={`${s.latitude},${s.longitude}`}
                    onPress={() => handleSelectSuggestion(s)}
                    padding={14}
                    flexDirection="row"
                    alignItems="center"
                    gap={10}
                    borderBottomWidth={0.5}
                    borderBottomColor={COLORS.border}
                  >
                    <Icon name="map-pin" size={14} color={COLORS.primary} />
                    <StyledText fontSize={14} color={COLORS.textPrimary} flex={1}>
                      {s.formattedAddress}
                    </StyledText>
                  </StyledPressable>
                ))}
              </Stack>
            )}

            {query.trim().length >= 3 && !suggestionsLoading && !suggestions?.length && (
              <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">
                No addresses found — try a different search.
              </StyledText>
            )}
          </Stack>
        </KeyboardAvoidingView>
      )}
    </Popup>
  );
}
