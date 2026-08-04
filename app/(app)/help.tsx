import { router } from "expo-router";
import { ScrollView } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, Stack, StyledText, StyledShape } from "fluent-styles";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, SHADOW_SOFT, SHADOW_CARD } from "../../src/lib/animations";

function HelpCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={12} style={[SHADOW_CARD, { elevation: 1.5 }]}>
      <Stack horizontal alignItems="center" gap={12}>
        <StyledShape size={40} cycle backgroundColor={COLORS.primaryLight}>
          <Icon name={icon as any} size={17} color={COLORS.primary} />
        </StyledShape>
        <StyledText fontSize={15} fontWeight="800" color={COLORS.textPrimary} style={{ flex: 1 }}>
          {title}
        </StyledText>
      </Stack>
      <Stack gap={8}>{children}</Stack>
    </Stack>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <StyledText fontSize={13.5} color={COLORS.textSecondary} lineHeight={20}>
      {children}
    </StyledText>
  );
}

export default function HelpScreen() {
  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <ScalePressable onPress={() => router.back()} toValue={0.88}>
            <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
              <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
            </Stack>
          </ScalePressable>
          <StyledText fontSize={18} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.2 }}>
            Help & Support
          </StyledText>
          <Stack width={40} height={40} />
        </Stack>
      </StyledPage.Header.Full>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Stack gap={16}>
          <HelpCard icon="clock" title="The 30-minute confirmation window">
            <P>
              When you place an order, your card is authorised but not charged. The restaurant then has 30
              minutes to confirm it.
            </P>
            <P>
              If they decline, or the 30 minutes runs out with no response, your order is automatically
              marked Declined or Expired — and because nothing was ever charged, there's nothing to refund
              and nothing you need to request. It just never happens.
            </P>
            <P>
              Occasionally a restaurant confirms but your bank needs extra verification (3D Secure) before
              the charge can go through — you'll see this as "Action needed" on the order, with its own
              30-minute window to complete it.
            </P>
          </HelpCard>

          <HelpCard icon="activity" title="Tracking your order">
            <P>
              Open the order from My Orders to see its live status — Awaiting confirmation, Confirmed,
              Preparing, Out for delivery, or Delivered (or Declined/Expired/Cancelled if it didn't go
              ahead). That screen refreshes itself automatically while it's open, so you don't need to pull
              to refresh.
            </P>
          </HelpCard>

          <HelpCard icon="x-circle" title="Cancelling an order">
            <P>
              You can cancel an order yourself from its details page while it's Awaiting confirmation,
              Confirmed, or Preparing. Once it's Out for delivery or Delivered, it can no longer be
              cancelled.
            </P>
          </HelpCard>

          <HelpCard icon="alert-triangle" title="Reporting a problem with a delivered order">
            <P>
              This isn't available in the app yet, even though it's something we do support behind the
              scenes — there's just no way to start it from here right now.
            </P>
            <P>
              In the meantime, if something was wrong with a delivered order, that order's details page has
              a call button when the restaurant has a phone number on file.
            </P>
          </HelpCard>

          <HelpCard icon="mail" title="Contact us">
            <P>
              There's no dedicated support email, phone line, or live chat set up yet. For an order in
              progress, the best option is the call button on that order's details page, when the
              restaurant has a phone number on file.
            </P>
          </HelpCard>
        </Stack>
      </ScrollView>
    </StyledPage>
  );
}
