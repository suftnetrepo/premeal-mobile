import { router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable, StyledCard, dialogueService } from "fluent-styles";
import { useAuth } from "../../src/auth/AuthContext";
import { COLORS } from "../../src/theme/colors";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

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

  return (
    <StyledPage showStatusBar statusBarProps={{ barStyle: "dark-content" }} flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader backgroundColor={COLORS.bgCard} borderBottomWidth={0.5} borderBottomColor={COLORS.border}>
        <StyledHeader.Full>
          <Stack flex={1} paddingHorizontal={18} paddingVertical={14} horizontal alignItems="center" justifyContent="space-between">
            <Stack gap={2}>
              <StyledText fontSize={22} fontWeight="800" color={COLORS.textPrimary}>
                Hey, {user?.name?.split(" ")[0] ?? "there"}! 👋
              </StyledText>
              <StyledText fontSize={13} color={COLORS.textMuted}>{user?.email}</StyledText>
            </Stack>
            <Stack width={48} height={48} borderRadius={24} backgroundColor={COLORS.primary} alignItems="center" justifyContent="center">
              <StyledText fontSize={18} fontWeight="800" color={COLORS.white}>{initial}</StyledText>
            </Stack>
          </Stack>
        </StyledHeader.Full>
      </StyledHeader>

      <Stack flex={1} padding={16} gap={10}>
        <StyledPressable onPress={() => router.push("/addresses")}>
          <StyledCard shadow="light" borderRadius={14} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={16}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack horizontal alignItems="center" gap={12}>
                <Stack width={36} height={36} borderRadius={10} backgroundColor={COLORS.primaryLight} alignItems="center" justifyContent="center">
                  <StyledText fontSize={18}>📍</StyledText>
                </Stack>
                <StyledText fontSize={15} fontWeight="600" color={COLORS.textPrimary}>Delivery addresses</StyledText>
              </Stack>
              <StyledText fontSize={16} color={COLORS.textMuted}>›</StyledText>
            </Stack>
          </StyledCard>
        </StyledPressable>

        <StyledPressable onPress={() => router.push("/orders")}>
          <StyledCard shadow="light" borderRadius={14} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={16}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack horizontal alignItems="center" gap={12}>
                <Stack width={36} height={36} borderRadius={10} backgroundColor={COLORS.primaryLight} alignItems="center" justifyContent="center">
                  <StyledText fontSize={18}>📋</StyledText>
                </Stack>
                <StyledText fontSize={15} fontWeight="600" color={COLORS.textPrimary}>My orders</StyledText>
              </Stack>
              <StyledText fontSize={16} color={COLORS.textMuted}>›</StyledText>
            </Stack>
          </StyledCard>
        </StyledPressable>

        <StyledPressable onPress={() => router.replace("/")}>
          <StyledCard shadow="light" borderRadius={14} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={16}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack horizontal alignItems="center" gap={12}>
                <Stack width={36} height={36} borderRadius={10} backgroundColor={COLORS.primaryLight} alignItems="center" justifyContent="center">
                  <StyledText fontSize={18}>🏠</StyledText>
                </Stack>
                <StyledText fontSize={15} fontWeight="600" color={COLORS.textPrimary}>Browse restaurants</StyledText>
              </Stack>
              <StyledText fontSize={16} color={COLORS.textMuted}>›</StyledText>
            </Stack>
          </StyledCard>
        </StyledPressable>

        <Stack flex={1} />

        <StyledPressable
          onPress={handleLogout}
          alignItems="center"
          paddingVertical={16}
          borderRadius={999}
          borderWidth={1}
          borderColor={COLORS.error}
          marginBottom={8}
        >
          <StyledText fontSize={15} fontWeight="700" color={COLORS.error}>Log out</StyledText>
        </StyledPressable>
      </Stack>
    </StyledPage>
  );
}
