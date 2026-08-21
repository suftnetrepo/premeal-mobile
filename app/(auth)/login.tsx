import { useState } from "react";
import { TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { StyledPage, Stack, StyledPressable, Spinner } from "fluent-styles";
import { Text } from "../../src/components/text";
import { useAuth } from "../../src/auth/AuthContext";
import { apiErrorMessage } from "../../src/api/client";
import { COLORS } from "../../src/theme/colors";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not log in"));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!email && !!password && !submitting;

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }} keyboardShouldPersistTaps="handled">
          <Stack gap={6} marginBottom={32}>
            <Text variant="display" color={COLORS.primary}>Pre-Meal</Text>
            <Text fontSize={26} fontWeight="800" color={COLORS.textPrimary}>Log in</Text>
            <Text variant="body" color={COLORS.textMuted}>Good to see you again.</Text>
          </Stack>

          <Stack gap={14}>
            <Stack gap={6}>
              <Text fontSize={13} fontWeight="600" color={COLORS.textSecondary}>Email</Text>
              <TextInput
                placeholder="you@example.com" placeholderTextColor={COLORS.textMuted}
                value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address"
                style={{ borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgCard }}
              />
            </Stack>
            <Stack gap={6}>
              <Text fontSize={13} fontWeight="600" color={COLORS.textSecondary}>Password</Text>
              <TextInput
                placeholder="••••••••" placeholderTextColor={COLORS.textMuted}
                value={password} onChangeText={setPassword} secureTextEntry
                style={{ borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgCard }}
              />
            </Stack>
          </Stack>

          {error && (
            <Stack marginTop={10} backgroundColor={COLORS.errorLight} borderRadius={10} padding={12}>
              <Text fontSize={13} color={COLORS.error}>{error}</Text>
            </Stack>
          )}

          <StyledPressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            alignItems="center"
            paddingVertical={17}
            borderRadius={999}
            backgroundColor={canSubmit ? COLORS.primary : COLORS.bgMuted}
            marginTop={24}
          >
            {submitting ? (
              <Spinner size={18} color={COLORS.white} />
            ) : (
              <Text fontSize={16} fontWeight="700" color={canSubmit ? COLORS.white : COLORS.textMuted}>Log in</Text>
            )}
          </StyledPressable>

          <StyledPressable alignItems="center" paddingVertical={16} onPress={() => router.push("/signup")}>
            <Text variant="body" color={COLORS.textMuted}>
              No account?{" "}
              <Text fontSize={14} fontWeight="700" color={COLORS.primary}>Sign up</Text>
            </Text>
          </StyledPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledPage>
  );
}
