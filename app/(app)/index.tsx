import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { Feather as Icon } from "@expo/vector-icons";
import {
  StyledPage,
  StyledHeader,
  StyledCard,
  StyledBadge,
  StyledShape,
  StyledImageBackground,
  StyledText,
  StyledPressable,
  StyledSpacer,
  Stack,
  Popup,
  toastService,
} from "fluent-styles";
import { useRestaurants } from "../../src/hooks/useRestaurants";
import { useAddresses } from "../../src/hooks/useAddresses";
import { useAddressSuggestions } from "../../src/hooks/useGeocode";
import { useLocation, locationFromAddress, type ActiveLocation } from "../../src/location/LocationContext";
import { useCart } from "../../src/cart/CartContext";
import { useAuth } from "../../src/auth/AuthContext";
import { useOnboarding } from "../../src/onboarding/OnboardingContext";
import { BasketBar } from "../../src/components/BasketBar";
import { formatMoney } from "../../src/lib/format";
import { COLORS } from "../../src/theme/colors";
import type { GeocodeSuggestion } from "../../src/api/geocode";
import type { Address, Restaurant } from "../../src/api/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { key: "schedule",    pill: "Scheduled delivery", title: "Order ahead,\neat on time.",  subtitle: "Confirmed within 30 min",            cta: "Explore now"     },
  { key: "transparent", pill: "Fair pricing",        title: "No markups,\nno surprises.", subtitle: "You pay what the restaurant charges", cta: "See restaurants" },
  { key: "reviews",     pill: "Verified reviews",    title: "Reviews you\ncan trust.",    subtitle: "Every review is from a real delivery", cta: "Browse now"      },
];

const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80",
];

// ─── Address icon — Home / Work / other ───────────────────────────────────────
function addressIcon(label: string | null | undefined): { name: string; bg: string; color: string } {
  const l = (label ?? "").toLowerCase();
  if (l === "home")   return { name: "home",     bg: COLORS.primaryLight, color: COLORS.primary };
  if (l === "work")   return { name: "briefcase", bg: "#EFF6FF",           color: "#1D4ED8"      };
  return               { name: "map-pin",  bg: COLORS.bgMuted,       color: COLORS.textMuted };
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
type Tab = "home" | "orders" | "rewards" | "account";
function BottomTabBar({ active }: { active: Tab }) {
  const insets = useSafeAreaInsets();
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "home",    label: "Home",    icon: "home"  },
    { key: "orders",  label: "Orders",  icon: "list"  },
    { key: "rewards", label: "Rewards", icon: "gift"  },
    { key: "account", label: "Account", icon: "user"  },
  ];
  function go(tab: Tab) {
    if (tab === "orders")  router.push("/orders");
    if (tab === "account") router.push("/account");
  }
  return (
    <Stack horizontal backgroundColor="#1C1917" paddingTop={12}
      paddingBottom={insets.bottom || 16} justifyContent="space-around" alignItems="center">
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <StyledPressable key={tab.key} onPress={() => go(tab.key)} alignItems="center" gap={4}>
            {on ? (
              <Stack backgroundColor={COLORS.primary} borderRadius={12}
                paddingHorizontal={20} paddingVertical={7} alignItems="center" justifyContent="center">
                <Icon name={tab.icon as any} size={20} color="#FFFFFF" />
              </Stack>
            ) : (
              <Icon name={tab.icon as any} size={22} color="#78716C" />
            )}
            <StyledText fontSize={10} fontWeight={on ? "700" : "400"}
              color={on ? COLORS.primary : "#78716C"}>
              {tab.label}
            </StyledText>
          </StyledPressable>
        );
      })}
    </Stack>
  );
}

// ─── Restaurant card ──────────────────────────────────────────────────────────
function RestaurantCard({ item, index, onPress }: { item: Restaurant; index: number; onPress: () => void }) {
  const image = item.imageUrl ?? CARD_IMAGES[index % CARD_IMAGES.length];
  return (
    <StyledPressable onPress={onPress} marginHorizontal={H_PAD} marginBottom={12} borderRadius={16} overflow="hidden"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <StyledImageBackground source={{ uri: image }} height={160} resizeMode="cover" />
      <Stack paddingHorizontal={14} paddingTop={12} paddingBottom={14} gap={5}
        borderWidth={0.5} borderTopWidth={0} borderColor={COLORS.border}
        borderBottomLeftRadius={16} borderBottomRightRadius={16} backgroundColor={COLORS.bgCard}>
        <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary}>{item.name}</StyledText>
        <Stack horizontal alignItems="center" gap={5}>
          <Icon name="star" size={12} color="#F59E0B" />
          {item.averageRating !== null ? (
            <>
              <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>{item.averageRating.toFixed(1)}</StyledText>
              <StyledText fontSize={13} color={COLORS.textMuted}>({item.reviewCount}) · {item.cuisine}</StyledText>
            </>
          ) : (
            <StyledText fontSize={13} color={COLORS.textMuted}>New · {item.cuisine}</StyledText>
          )}
        </Stack>
        <Stack horizontal alignItems="center" gap={8} flexWrap="wrap">
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="clock" size={11} color={COLORS.textMuted} />
            <StyledText fontSize={12} color={COLORS.textMuted}>Slots available</StyledText>
          </Stack>
          <StyledText fontSize={12} color={COLORS.border}>·</StyledText>
          <Stack horizontal alignItems="center" gap={4}>
            <Icon name="truck" size={11} color={COLORS.textMuted} />
            <StyledText fontSize={12} color={COLORS.textMuted}>£2.99 delivery</StyledText>
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

// ─── Address row inside the picker ────────────────────────────────────────────
function AddressRow({ addr, active, onSelect }: {
  addr: Address;
  active: boolean;
  onSelect: (addr: Address) => void;
}) {
  const ico = addressIcon(addr.label);
  return (
    <StyledPressable
      onPress={() => onSelect(addr)}
      horizontal alignItems="center" gap={12}
      padding={14} borderRadius={12}
      borderWidth={active ? 1.5 : 0.5}
      borderColor={active ? COLORS.primary : COLORS.border}
      backgroundColor={active ? COLORS.primaryLight : COLORS.bgCard}
      marginBottom={8}
    >
      {/* Icon */}
      <StyledShape size={36} borderRadius={10} backgroundColor={ico.bg}>
        <Icon name={ico.name as any} size={17} color={ico.color} />
      </StyledShape>

      {/* Text */}
      <Stack flex={1} gap={2}>
        <Stack horizontal alignItems="center" gap={8}>
          <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
            {addr.label ?? "Address"}
          </StyledText>
          {addr.isDefault && (
            <StyledBadge
              backgroundColor={COLORS.primaryLight}
              color={COLORS.primary}
              paddingHorizontal={8} paddingVertical={2}
              borderRadius={999} fontSize={10} fontWeight="700"
            >
              Default
            </StyledBadge>
          )}
        </Stack>
        <StyledText fontSize={12} color={COLORS.textMuted} numberOfLines={1}>
          {addr.address}
        </StyledText>
      </Stack>

      {/* Check */}
      {active && <Icon name="check-circle" size={20} color={COLORS.primary} />}
    </StyledPressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const sliderRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [query, setQuery] = useState("");

  const { active, status, setActive } = useLocation();
  const { user } = useAuth();
  const { reset: resetOnboarding } = useOnboarding();
  const { data: addresses } = useAddresses();
  const cart = useCart();

  const { data: suggestions, isFetching: suggestionsLoading } = useAddressSuggestions(query);
  const { data: restaurants, isLoading, error } = useRestaurants(
    active ? { lat: active.lat, lng: active.lng } : undefined
  );

  function handleSliderScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== slideIndex) setSlideIndex(idx);
  }

  // User picked a saved address from the picker
  async function handleSelectSavedAddress(addr: Address) {
    const loc = await locationFromAddress(addr);
    if (!loc) {
      toastService.error("Could not get location", "Try entering the address manually.");
      return;
    }
    setActive(loc);
    setPickerOpen(false);
  }

  // User picked a suggestion from the search input
  function handleSelectSuggestion(s: GeocodeSuggestion) {
    setActive({
      lat: s.latitude,
      lng: s.longitude,
      formattedAddress: s.formattedAddress,
    });
    setQuery("");
    setPickerOpen(false);
    setAddingNew(false);
  }

  // Location pill display text
  const pillLabel = active?.label
    ? `${active.label} · ${active.formattedAddress.split(",")[0]}`
    : active?.formattedAddress
    ? active.formattedAddress.split(",").slice(0, 2).join(",")
    : status === "loading"
    ? "Detecting location…"
    : "Set your address";

  return (
    <StyledPage showStatusBar statusBarProps={{ barStyle: "dark-content" }} flex={1} backgroundColor="#F8F8F8">

      {/* ── Header ────────────────────────────────────────────────── */}
       <StyledPage.Header.Full>
          <Stack flex={1} paddingHorizontal={H_PAD} paddingTop={6} paddingBottom={14} gap={12}>

            {/* Row 1: avatar · location · bell */}
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack horizontal alignItems="center" gap={10}>
                <StyledShape size={40} borderRadius={20}
                  backgroundColor={user ? COLORS.primaryLight : COLORS.bgMuted}
                  borderWidth={user ? 2 : 0} borderColor={COLORS.primary}>
                  <Icon name="user" size={18} color={user ? COLORS.primary : COLORS.textMuted} />
                </StyledShape>
                <Stack gap={2}>
                  <StyledText fontSize={10} color={COLORS.textMuted}>Delivering to</StyledText>
                  <StyledPressable horizontal alignItems="center" gap={4} onPress={() => { setAddingNew(false); setPickerOpen(true); }}>
                    <Icon name={active?.label ? addressIcon(active.label).name as any : "map-pin"} size={12} color={COLORS.primary} />
                    <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary} numberOfLines={1}
                      style={{ maxWidth: SCREEN_WIDTH - 160 }}>
                      {pillLabel}
                    </StyledText>
                    <Icon name="chevron-down" size={12} color={COLORS.primary} />
                  </StyledPressable>
                </Stack>
              </Stack>
              <StyledPressable width={40} height={40} borderRadius={20}
                borderWidth={1} borderColor={COLORS.border}
                alignItems="center" justifyContent="center" backgroundColor="#FFFFFF">
                <Icon name="bell" size={18} color={COLORS.textPrimary} />
              </StyledPressable>
            </Stack>

            {/* Row 2: search bar */}
            <Stack horizontal alignItems="center" gap={10}>
              <StyledPressable flex={1} horizontal alignItems="center" gap={10}
                borderWidth={1} borderColor={COLORS.border} borderRadius={12}
                paddingHorizontal={14} paddingVertical={11} backgroundColor={COLORS.bgMuted}
                onPress={() => { setAddingNew(true); setPickerOpen(true); }}>
                <Icon name="search" size={15} color={COLORS.textMuted} />
                <StyledText fontSize={13} color={COLORS.textMuted}>Search dish, restaurant…</StyledText>
              </StyledPressable>
              <Stack width={44} height={44} borderRadius={12}
                backgroundColor={COLORS.primary} alignItems="center" justifyContent="center">
                <Icon name="sliders" size={18} color="#FFFFFF" />
              </Stack>
            </Stack>

          </Stack>
        </StyledPage.Header.Full>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>

        {/* Hero slider */}
        <Stack height={206} overflow="hidden">
          <ScrollView ref={sliderRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16} onMomentumScrollEnd={handleSliderScroll} style={{ width: SCREEN_WIDTH }}>
            {SLIDES.map((slide) => (
              <Stack key={slide.key} width={SCREEN_WIDTH} paddingHorizontal={H_PAD}>
                <Stack flex={1} backgroundColor={COLORS.primary} borderRadius={20} overflow="hidden"
                  justifyContent="flex-end" padding={20}>
                  <Stack position="absolute" top={-20} right={-20} width={130} height={130} borderRadius={65} backgroundColor="rgba(255,255,255,0.10)" />
                  <Stack position="absolute" top={40} right={50} width={80} height={80} borderRadius={40} backgroundColor="rgba(255,255,255,0.07)" />
                  <Stack position="absolute" bottom={-30} right={20} width={110} height={110} borderRadius={55} backgroundColor="rgba(255,255,255,0.07)" />
                  <Stack gap={6} style={{ zIndex: 1 }}>
                    <Stack backgroundColor="rgba(255,255,255,0.22)" borderRadius={999}
                      paddingHorizontal={10} paddingVertical={4} alignSelf="flex-start">
                      <StyledText fontSize={11} fontWeight="700" color="#FFFFFF">{slide.pill}</StyledText>
                    </Stack>
                    <StyledText fontSize={20} fontWeight="800" color="#FFFFFF" lineHeight={26} style={{ letterSpacing: -0.3 }}>
                      {slide.title}
                    </StyledText>
                    <StyledText fontSize={13} color="rgba(255,255,255,0.85)">{slide.subtitle}</StyledText>
                    <StyledPressable backgroundColor="#1C1917" borderRadius={999}
                      paddingHorizontal={18} paddingVertical={9} alignSelf="flex-start" marginTop={2}>
                      <StyledText fontSize={13} fontWeight="700" color="#FFFFFF">{slide.cta}</StyledText>
                    </StyledPressable>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </ScrollView>
        </Stack>

        {/* Dots */}
        <Stack horizontal justifyContent="center" alignItems="center" gap={5} marginTop={10} marginBottom={14}>
          {SLIDES.map((_, i) => (
            <Stack key={i} width={i === slideIndex ? 18 : 6} height={6} borderRadius={3}
              backgroundColor={i === slideIndex ? COLORS.primary : COLORS.border} />
          ))}
        </Stack>

        {/* ── New user prompt — no address set ──────────────────── */}
        {(status === "needs-address" || status === "guest") && (
          <StyledCard shadow="light" borderRadius={16} marginHorizontal={H_PAD}
            marginBottom={14} padding={18} backgroundColor={COLORS.bgCard}
            borderWidth={0.5} borderColor={COLORS.border}>
            <Stack gap={10}>
              <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>
                Where should we deliver?
              </StyledText>
              <StyledText fontSize={13} color={COLORS.textMuted} lineHeight={18}>
                Enter your address to see restaurants that actually deliver to you.
              </StyledText>
              <StyledPressable
                onPress={() => { setAddingNew(true); setPickerOpen(true); }}
                horizontal alignItems="center" justifyContent="center" gap={8}
                backgroundColor={COLORS.primary} borderRadius={999} paddingVertical={12}>
                <Icon name="map-pin" size={15} color="#FFFFFF" />
                <StyledText fontSize={14} fontWeight="700" color="#FFFFFF">Set delivery address</StyledText>
              </StyledPressable>
            </Stack>
          </StyledCard>
        )}

        {/* ── No coverage banner ─────────────────────────────────── */}
        {status === "ready" && !isLoading && !error && (restaurants ?? []).length === 0 && (
          <Stack marginHorizontal={H_PAD} marginBottom={14} padding={14} borderRadius={12}
            backgroundColor={COLORS.warningLight} borderWidth={0.5} borderColor="#FED7AA"
            horizontal alignItems="flex-start" gap={10}>
            <Icon name="alert-circle" size={18} color={COLORS.warning} style={{ marginTop: 1 }} />
            <Stack flex={1} gap={4}>
              <StyledText fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
                No restaurants deliver here yet
              </StyledText>
              <StyledText fontSize={12} color={COLORS.textSecondary} lineHeight={17}>
                We don't have partners that cover this area. Try a nearby town or city.
              </StyledText>
              <StyledPressable
                onPress={() => { setAddingNew(true); setPickerOpen(true); }}
                alignSelf="flex-start" marginTop={4}>
                <StyledText fontSize={12} fontWeight="700" color={COLORS.primary}>
                  Try a different address →
                </StyledText>
              </StyledPressable>
            </Stack>
          </Stack>
        )}

        {/* ── Section label ──────────────────────────────────────── */}
        {status === "ready" && !isLoading && !error && (restaurants ?? []).length > 0 && (
          <StyledText fontSize={13} fontWeight="600" color={COLORS.textMuted}
            paddingHorizontal={H_PAD} marginBottom={10}>
            {restaurants!.length} restaurant{restaurants!.length !== 1 ? "s" : ""}
            {active?.label ? ` deliver to ${active.label}` : active ? " near you" : ""}
          </StyledText>
        )}

        {isLoading && (
          <Stack alignItems="center" paddingVertical={32}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </Stack>
        )}

        {error && (
          <Stack marginHorizontal={H_PAD} padding={14} borderRadius={12} backgroundColor={COLORS.errorLight}>
            <StyledText fontSize={14} color={COLORS.error}>Could not load restaurants. Check your connection.</StyledText>
          </Stack>
        )}

        {/* ── Restaurant cards ───────────────────────────────────── */}
        {(restaurants ?? []).map((item, index) => (
          <RestaurantCard key={item.id} item={item} index={index}
            onPress={() => router.push(`/restaurant/${item.id}`)} />
        ))}

      </ScrollView>

      {cart.itemCount > 0 && <BasketBar />}
      <BottomTabBar active="home" />

      {/* ── Address picker popup ──────────────────────────────────── */}
      <Popup
        visible={pickerOpen}
        onClose={() => { setPickerOpen(false); setAddingNew(false); setQuery(""); }}
        title={addingNew ? "Add delivery address" : "Choose delivery address"}
        showClose
        position="bottom"
        safeAreaBottom
      >
        {!addingNew ? (
          /* ── Saved addresses list ───────────────────────────────── */
          <Stack padding={20} gap={2}>
            {(addresses ?? []).map((addr) => (
              <AddressRow
                key={addr.id}
                addr={addr}
                active={active?.addressId === addr.id}
                onSelect={handleSelectSavedAddress}
              />
            ))}

            {/* ── No addresses yet ─────────────────────────────── */}
            {(!addresses || addresses.length === 0) && (
              <Stack alignItems="center" paddingVertical={16} gap={6}>
                <Icon name="map-pin" size={28} color={COLORS.border} />
                <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">
                  No saved addresses yet.
                </StyledText>
              </Stack>
            )}

            <StyledSpacer height={4} />

            {/* ── Add new address button ───────────────────────── */}
            <StyledPressable
              onPress={() => setAddingNew(true)}
              horizontal alignItems="center" gap={10}
              padding={14} borderRadius={12}
              borderWidth={0.5} borderColor={COLORS.primary}
              backgroundColor={COLORS.primaryLight}
            >
              <StyledShape size={36} borderRadius={10} backgroundColor={COLORS.primary}>
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
          /* ── Add new address — search ───────────────────────────── */
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Stack padding={20} gap={12}>

              {/* Back link */}
              {(addresses ?? []).length > 0 && (
                <StyledPressable onPress={() => { setAddingNew(false); setQuery(""); }}
                  horizontal alignItems="center" gap={6} alignSelf="flex-start">
                  <Icon name="arrow-left" size={15} color={COLORS.primary} />
                  <StyledText fontSize={13} fontWeight="600" color={COLORS.primary}>Back to saved</StyledText>
                </StyledPressable>
              )}

              {/* Search input */}
              <Stack horizontal alignItems="center" gap={10}
                borderWidth={1} borderColor={COLORS.border} borderRadius={12}
                paddingHorizontal={14} paddingVertical={2} backgroundColor={COLORS.bgCard}>
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

              {/* Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <Stack borderWidth={0.5} borderColor={COLORS.border} borderRadius={12}
                  backgroundColor={COLORS.bgCard} overflow="hidden">
                  {suggestions.map((s: GeocodeSuggestion) => (
                    <StyledPressable
                      key={`${s.latitude},${s.longitude}`}
                      onPress={() => handleSelectSuggestion(s)}
                      padding={14} horizontal alignItems="center" gap={10}
                      borderBottomWidth={0.5} borderBottomColor={COLORS.border}>
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

    </StyledPage>
  );
}
