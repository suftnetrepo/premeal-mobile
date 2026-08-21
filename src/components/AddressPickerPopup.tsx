import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform, ScrollView, TextInput } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { Stack, StyledPressable, StyledShape, StyledBadge, StyledSpacer, Popup, toastService, Spinner } from "fluent-styles";
import { Text } from "./text";
import { useAddresses } from "../hooks/useAddresses";
import { useAddressSuggestions } from "../hooks/useGeocode";
import { locationFromAddress, type ActiveLocation } from "../location/LocationContext";
import { useOnboarding } from "../onboarding/OnboardingContext";
import { COLORS } from "../theme/colors";
import type { GeocodeSuggestion } from "../api/geocode";
import type { Address } from "../api/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Popup's bottom sheet is rendered inside an animated (transform-based)
// slide-up container — KeyboardAvoidingView's automatic measurement gets
// confused nested inside that (a well-known RN gotcha: it assumes plain
// document flow, not an animated/transformed ancestor) and was observed
// pushing the entire sheet content out of the visible area, not just
// failing to help. Tracking keyboard height manually via Keyboard events
// and applying it as plain numeric padding/maxHeight sidesteps that
// measurement bug entirely — no reliance on viewport-relative layout math.
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}

// Popup doesn't resize/scroll for its own content — that's on the caller
// (same issue already hit and fixed on checkout's delivery-slot Popup).
// Keeping the suggestion list bounded and independently scrollable is
// what actually keeps overflow suggestions reachable, keyboard or not.
const SUGGESTIONS_MAX_HEIGHT = SCREEN_HEIGHT * 0.32;

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
      <StyledShape size={36} cycle borderRadius={10} backgroundColor={ico.bg}>
        <Icon name={ico.name as any} size={17} color={ico.color} />
      </StyledShape>
      <Stack flex={1} gap={2}>
        <Stack horizontal alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
            {addr.label ?? "Address"}
          </Text>
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
        <Text variant="bodySmall" color={COLORS.textMuted} numberOfLines={1}>
          {addr.address}
        </Text>
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
  const keyboardHeight = useKeyboardHeight();

  // If there are no saved addresses, go straight to search — don't show
  // an empty list with just an "Add new" button.
  const hasAddresses = (addresses ?? []).length > 0;
  const showSearch = addingNew || !hasAddresses;

  // Shrinks as the keyboard eats into the screen, so the input + result
  // list always fit above it instead of assuming the sheet grows to match.
  const suggestionsMaxHeight =
    keyboardHeight > 0 ? Math.max(120, SCREEN_HEIGHT - keyboardHeight - 260) : SUGGESTIONS_MAX_HEIGHT;

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
              <Text variant="body" color={COLORS.textMuted} textAlign="center">
                No saved addresses yet.
              </Text>
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
            <Text fontSize={14} fontWeight="700" color={COLORS.primary}>
              Add a new address
            </Text>
          </StyledPressable>

          {__DEV__ && (
            <StyledPressable onPress={resetOnboarding} alignItems="center" paddingTop={12}>
              <Text variant="caption" color={COLORS.textMuted}>🛠 Reset onboarding (dev only)</Text>
            </StyledPressable>
          )}
        </Stack>
      ) : (
        <Stack padding={20} gap={12} style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : 20 }}>
          {(addresses ?? []).length > 0 && (
            <StyledPressable onPress={() => { setAddingNew(false); setQuery(""); }} flexDirection="row" alignItems="center" gap={6} alignSelf="flex-start">
              <Icon name="arrow-left" size={15} color={COLORS.primary} />
              <Text fontSize={13} fontWeight="600" color={COLORS.primary}>Back to saved</Text>
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

          {suggestionsLoading && <Spinner size={22} color={COLORS.primary} />}

          {suggestions && suggestions.length > 0 && (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: suggestionsMaxHeight }}
            >
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
                    <Text variant="body" color={COLORS.textPrimary} flex={1}>
                      {s.formattedAddress}
                    </Text>
                  </StyledPressable>
                ))}
              </Stack>
            </ScrollView>
          )}

          {query.trim().length >= 3 && !suggestionsLoading && !suggestions?.length && (
            <Text variant="body" color={COLORS.textMuted} textAlign="center">
              No addresses found — try a different search.
            </Text>
          )}
        </Stack>
      )}
    </Popup>
  );
}
