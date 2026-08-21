import { router } from "expo-router";
import { ScrollView } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, Stack, StyledShape } from "fluent-styles";
import { Text } from "../../src/components/text";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, SHADOW_SOFT, SHADOW_CARD } from "../../src/lib/animations";

function InfoCard({
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
        <Text fontSize={15} fontWeight="800" color={COLORS.textPrimary} style={{ flex: 1 }}>
          {title}
        </Text>
      </Stack>
      <Stack gap={8}>{children}</Stack>
    </Stack>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize={13.5} color={COLORS.textSecondary} lineHeight={20}>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Stack horizontal gap={8} alignItems="flex-start">
      <Text fontSize={13.5} color={COLORS.textMuted}>
        •
      </Text>
      <Text fontSize={13.5} color={COLORS.textSecondary} lineHeight={20} style={{ flex: 1 }}>
        {children}
      </Text>
    </Stack>
  );
}

export default function PrivacyScreen() {
  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header.Full>
        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <ScalePressable onPress={() => router.back()} toValue={0.88}>
            <Stack width={40} height={40} borderRadius={20} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF" style={SHADOW_SOFT}>
              <Icon name="chevron-left" size={20} color={COLORS.textPrimary} />
            </Stack>
          </ScalePressable>
          <Text fontSize={18} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.2 }}>
            Privacy & Security
          </Text>
          <Stack width={40} height={40} />
        </Stack>
      </StyledPage.Header.Full>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Stack gap={16}>
          {/* Informational-only notice — this is not the legal document. */}
          <Stack
            horizontal
            gap={10}
            alignItems="flex-start"
            backgroundColor={COLORS.warningLight}
            borderRadius={20}
            padding={16}
          >
            <Icon name="info" size={16} color={COLORS.warning} style={{ marginTop: 1 }} />
            <Text fontSize={12.5} color={COLORS.textSecondary} lineHeight={18} style={{ flex: 1 }}>
              This page is a plain-language summary for information only — it isn't a substitute for
              Pre-Meal's formal Terms of Service and Privacy Policy, and it isn't legal advice.
            </Text>
          </Stack>

          <InfoCard icon="credit-card" title="Payments">
            <P>
              All payment processing is handled by Stripe. Pre-Meal never sees or stores your full card
              number, expiry date, or security code.
            </P>
            <P>
              What we do store is a Stripe-issued reference — a customer ID and a payment method ID — used
              to charge your card once a restaurant confirms your order. There's no "saved cards" list: you
              enter your card details at every checkout.
            </P>
          </InfoCard>

          <InfoCard icon="database" title="What we store, and why">
            <Bullet>Your name and email address, to run your account</Bullet>
            <Bullet>Your password, stored as a salted hash — never in a form we (or anyone else) can read back</Bullet>
            <Bullet>Delivery addresses you save or enter, so we can check which restaurants deliver there</Bullet>
            <Bullet>Your order history — what you ordered, when, from where, and what was charged</Bullet>
            <Bullet>Reviews you write, shown publicly on the restaurant's page</Bullet>
          </InfoCard>

          <InfoCard icon="map-pin" title="Location">
            <P>
              If you allow it, the app uses your device's location to help find restaurants that deliver to
              you. You can decline this and enter an address manually instead.
            </P>
          </InfoCard>

          <InfoCard icon="eye-off" title="What we don't do">
            <Bullet>No analytics or advertising tracking is built into this app today</Bullet>
            <Bullet>We don't sell your personal data to third parties</Bullet>
          </InfoCard>

          <InfoCard icon="shield" title="Certifications">
            <P>
              This app has not undergone formal privacy or security certification (for example GDPR, CCPA,
              or SOC 2 audits) — we're not claiming any of those here.
            </P>
          </InfoCard>
        </Stack>
      </ScrollView>
    </StyledPage>
  );
}
