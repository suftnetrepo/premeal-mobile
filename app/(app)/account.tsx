import { router } from "expo-router";
import { Animated, ScrollView } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, Stack, StyledText, StyledShape, dialogueService, loaderService, toastService } from "fluent-styles";
import { useAuth } from "../../src/auth/AuthContext";
import { BottomTabBar } from "../../src/components/BottomTabBar";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, useFadeUp, SHADOW_SOFT, SHADOW_CARD } from "../../src/lib/animations";

// Real navigation targets that already exist in the app.
const PRIMARY_ITEMS = [
  { icon: "map-pin", title: "Delivery addresses", subtitle: "Manage your saved addresses", onPress: () => router.push("/addresses") },
  { icon: "clipboard", title: "My orders", subtitle: "View your past and upcoming orders", onPress: () => router.push("/orders") },
  { icon: "home", title: "Browse restaurants", subtitle: "Discover and order your favourites", onPress: () => router.replace("/") },
];

// Promo codes have no "browse / manage" feature behind them — there's no
// endpoint for it, just checkout's real /api/checkout/validate-promo. So
// this doesn't open a page; it tells the customer where the real one lives.
function explainPromoCodes() {
  dialogueService.alert(
    "Promo codes",
    "Promo codes are entered during checkout, right before payment — there's nowhere else to browse or redeem one right now."
  );
}

const SECONDARY_ITEMS = [
  { icon: "tag", title: "Promo codes", subtitle: "Where to enter a code", onPress: explainPromoCodes },
  { icon: "shield", title: "Privacy & security", subtitle: "How your data is handled", onPress: () => router.push("/privacy") },
  { icon: "help-circle", title: "Help & support", subtitle: "Get help and contact us", onPress: () => router.push("/help") },
  { icon: "info", title: "About", subtitle: "How Pre-Meal works, app version", onPress: () => router.push("/about") },
];

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  isLast,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <ScalePressable onPress={onPress} toValue={0.98}>
      <Stack>
        <Stack horizontal alignItems="center" gap={14} paddingVertical={16} paddingHorizontal={18} style={{ minHeight: 44 }}>
          <StyledShape size={44} cycle backgroundColor={COLORS.primaryLight}>
            <Icon name={icon as any} size={19} color={COLORS.primary} />
          </StyledShape>
          <Stack flex={1} gap={2}>
            <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary}>
              {title}
            </StyledText>
            <StyledText fontSize={12.5} color={COLORS.textMuted}>
              {subtitle}
            </StyledText>
          </Stack>
          <Icon name="chevron-right" size={19} color={COLORS.textMuted} />
        </Stack>
        {!isLast && <Stack height={1} backgroundColor={COLORS.border} marginLeft={18 + 44 + 14} />}
      </Stack>
    </ScalePressable>
  );
}

function SettingsGroup({ items }: { items: typeof PRIMARY_ITEMS }) {
  return (
    <Stack backgroundColor={COLORS.bgCard} borderRadius={28} overflow="hidden" style={[SHADOW_CARD, { elevation: 1.5 }]}>
      {items.map((item, i) => (
        <SettingsRow key={item.title} {...item} isLast={i === items.length - 1} />
      ))}
    </Stack>
  );
}

export default function AccountScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();
  const headerAnim = useFadeUp(0);
  const groupsAnim = useFadeUp(100);

  async function handleLogout() {
    const confirmed = await dialogueService.confirm({
      title: "Log out?",
      message: "You'll need to sign in again next time.",
      confirmLabel: "Log out",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (confirmed) logout();
  }

  async function handleDeleteAccount() {
    const confirmed = await dialogueService.confirm({
      title: "Delete your account?",
      message:
        "This permanently removes your name, email, password, and saved addresses. This can't be undone, and you won't be able to log back in with this account.",
      confirmLabel: "Delete ",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await loaderService.wrap(() => deleteAccount(), { label: "Deleting your account…" });
      router.replace("/");
    } catch {
      // Deliberately not silent — deleteAccount() in AuthContext doesn't
      // swallow failures the way logout does, on purpose. If this
      // throws, the account genuinely still exists server-side, and the
      // person needs to know that rather than assume it worked.
      toastService.error("Couldn't delete your account", "Check your connection and try again.");
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Animated.View style={headerAnim}>
          <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
            <Stack horizontal alignItems="center" gap={14} flex={1}>
              <StyledShape size={64} cycle backgroundColor={COLORS.primaryLight}>
                <StyledText fontSize={24} fontWeight="800" color={COLORS.primary}>
                  {initial}
                </StyledText>
              </StyledShape>
              <Stack gap={2} flex={1}>
                <StyledText fontSize={21} fontWeight="800" color={COLORS.textPrimary} numberOfLines={1} style={{ letterSpacing: -0.3 }}>
                  Hey {user?.name?.split(" ")[0] ?? "there"}! 👋
                </StyledText>
                <StyledText fontSize={13} color={COLORS.textMuted} numberOfLines={1}>
                  {user?.email}
                </StyledText>
              </Stack>
            </Stack>
            {/* Decorative — this page already contains the app's settings. */}
            <Stack width={44} height={44} borderRadius={22} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
              <Icon name="settings" size={19} color={COLORS.primary} />
            </Stack>
          </Stack>
        </Animated.View>
      </StyledPage.Header.Full>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={groupsAnim}>
          <Stack gap={20}>
            <SettingsGroup items={PRIMARY_ITEMS} />
            <SettingsGroup items={SECONDARY_ITEMS} />
          </Stack>
        </Animated.View>

        <ScalePressable onPress={handleLogout} toValue={0.97}>
          <Stack
            horizontal
            alignItems="center"
            justifyContent="center"
            gap={8}
            paddingVertical={17}
            borderRadius={999}
            borderWidth={1.5}
            borderColor={COLORS.error}
            backgroundColor="#FFFFFF"
            marginTop={20}
          >
            <Icon name="log-out" size={17} color={COLORS.error} />
            <StyledText fontSize={15} fontWeight="700" color={COLORS.error}>
              Log out
            </StyledText>
          </Stack>
        </ScalePressable>

        {/* Filled, not outlined like Log out above — this is a
            meaningfully more severe, irreversible action and shouldn't
            read as a peer of it. */}
        <ScalePressable onPress={handleDeleteAccount} toValue={0.97}>
          <Stack
            horizontal
            alignItems="center"
            justifyContent="center"
            gap={8}
            paddingVertical={17}
            borderRadius={999}
            backgroundColor={COLORS.error}
            marginTop={12}
          >
            <Icon name="trash-2" size={17} color="#FFFFFF" />
            <StyledText fontSize={15} fontWeight="700" color="#FFFFFF">
              Delete account
            </StyledText>
          </Stack>
        </ScalePressable>
      </ScrollView>

      <BottomTabBar active="account" />
    </StyledPage>
  );
}
