import { router } from "expo-router";
import Constants from "expo-constants";
import { ScrollView } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { StyledPage, Stack, StyledShape } from "fluent-styles";
import { Text } from "../../src/components/text";
import { COLORS } from "../../src/theme/colors";
import { ScalePressable, SHADOW_SOFT, SHADOW_CARD } from "../../src/lib/animations";

// Mirrors premeal-app's own /about page copy — same real mission
// statement, not a separate marketing pitch invented for mobile.
const HOW_IT_WORKS = [
  {
    icon: "calendar",
    title: "Order ahead, on your time",
    body: "Pick a delivery day and time slot. The restaurant has 30 minutes to confirm — your card isn't charged until they do.",
  },
  {
    icon: "truck",
    title: "Restaurants deliver it themselves",
    body: "Each restaurant delivers with its own team, or with drivers it has personally invited — not a shared, marketplace-wide fleet.",
  },
  {
    icon: "credit-card",
    title: "Pay exactly what the restaurant charges",
    body: "No markup on food. Each restaurant sets its own delivery fee and minimum order — Pre-Meal doesn't add anything on top.",
  },
  {
    icon: "star",
    title: "Reviews you can trust",
    body: "Every review comes from a real, delivered order — never solicited or paid for.",
  },
];

function InfoRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <Stack horizontal alignItems="flex-start" gap={14}>
      <StyledShape size={44} cycle backgroundColor={COLORS.primaryLight}>
        <Icon name={icon as any} size={19} color={COLORS.primary} />
      </StyledShape>
      <Stack flex={1} gap={3}>
        <Text fontSize={14.5} fontWeight="800" color={COLORS.textPrimary}>
          {title}
        </Text>
        <Text fontSize={13} color={COLORS.textSecondary} lineHeight={19}>
          {body}
        </Text>
      </Stack>
    </Stack>
  );
}

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

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
            About
          </Text>
          <Stack width={40} height={40} />
        </Stack>
      </StyledPage.Header.Full>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Stack gap={20}>
          <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={8} style={[SHADOW_CARD, { elevation: 1.5 }]}>
            <Text fontSize={11} fontWeight="800" color={COLORS.primary} style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
              Pre-Meal
            </Text>
            <Text fontSize={24} fontWeight="800" color={COLORS.textPrimary} style={{ letterSpacing: -0.4 }}>
              Food, on your schedule.
            </Text>
            <Text variant="body" color={COLORS.textSecondary} lineHeight={21}>
              Most delivery apps optimise for speed right now — but not every order needs to arrive in 20
              minutes. Pre-Meal is built for the times you already know exactly when you want to eat: order
              ahead, pick a delivery window, and the restaurant confirms within 30 minutes so they can cook
              for a real, scheduled order rather than rushing one out the door.
            </Text>
          </Stack>

          <Stack backgroundColor={COLORS.bgCard} borderRadius={26} padding={20} gap={20} style={[SHADOW_CARD, { elevation: 1.5 }]}>
            <Text fontSize={12.5} fontWeight="700" color={COLORS.textMuted} style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
              How it works
            </Text>
            {HOW_IT_WORKS.map((item) => (
              <InfoRow key={item.title} {...item} />
            ))}
          </Stack>

          <Stack backgroundColor={COLORS.primaryLight} borderRadius={22} padding={18} horizontal gap={12} alignItems="flex-start">
            <Icon name="clock" size={17} color={COLORS.primary} style={{ marginTop: 1 }} />
            <Stack flex={1} gap={3}>
              <Text fontSize={13.5} fontWeight="800" color={COLORS.textPrimary}>
                Pre-Meal+ — coming later
              </Text>
              <Text fontSize={12.5} color={COLORS.textSecondary} lineHeight={18}>
                A subscription plan (free delivery and a discount on every order) is built into Pre-Meal but
                isn't switched on yet — it isn't something you can sign up for today.
              </Text>
            </Stack>
          </Stack>

          <Stack alignItems="center" gap={2} paddingTop={8}>
            <Text fontSize={13} fontWeight="700" color={COLORS.textPrimary}>
              Pre-Meal
            </Text>
            <Text variant="bodySmall" color={COLORS.textMuted}>
              Version {version}
            </Text>
          </Stack>
        </Stack>
      </ScrollView>
    </StyledPage>
  );
}
