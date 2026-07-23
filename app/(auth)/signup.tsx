import { useState } from "react";
import { ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable } from "fluent-styles";
import { useAuth } from "../../src/auth/AuthContext";
import { apiErrorMessage } from "../../src/api/client";
import { COLORS } from "../../src/theme/colors";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!name && !!email && !!password && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not sign up"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StyledPage showStatusBar statusBarProps={{ barStyle: "dark-content" }} flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader  backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }} keyboardShouldPersistTaps="handled">
          <Stack gap={6} marginBottom={32}>
            <StyledText fontSize={32} fontWeight="800" color={COLORS.primary}>Pre-Meal</StyledText>
            <StyledText fontSize={26} fontWeight="800" color={COLORS.textPrimary}>Create account</StyledText>
            <StyledText fontSize={14} color={COLORS.textMuted}>Order ahead, eat on time.</StyledText>
          </Stack>

          <Stack gap={14}>
            {[
              { label: "Name",     value: name,     set: setName,     placeholder: "Your name",         secure: false, keyboard: "default" as const },
              { label: "Email",    value: email,    set: setEmail,    placeholder: "you@example.com",    secure: false, keyboard: "email-address" as const },
              { label: "Password", value: password, set: setPassword, placeholder: "8+ characters",       secure: true,  keyboard: "default" as const },
            ].map((field) => (
              <Stack key={field.label} gap={6}>
                <StyledText fontSize={13} fontWeight="600" color={COLORS.textSecondary}>{field.label}</StyledText>
                <TextInput
                  placeholder={field.placeholder} placeholderTextColor={COLORS.textMuted}
                  value={field.value} onChangeText={field.set}
                  secureTextEntry={field.secure} keyboardType={field.keyboard}
                  autoCapitalize={field.keyboard === "email-address" ? "none" : "words"}
                  style={{ borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgCard }}
                />
              </Stack>
            ))}
          </Stack>

          {error && (
            <Stack marginTop={10} backgroundColor={COLORS.errorLight} borderRadius={10} padding={12}>
              <StyledText fontSize={13} color={COLORS.error}>{error}</StyledText>
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
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <StyledText fontSize={16} fontWeight="700" color={canSubmit ? COLORS.white : COLORS.textMuted}>Create account</StyledText>
            )}
          </StyledPressable>

          <StyledPressable alignItems="center" paddingVertical={16} onPress={() => router.push("/login")}>
            <StyledText fontSize={14} color={COLORS.textMuted}>
              Already have an account?{" "}
              <StyledText fontSize={14} fontWeight="700" color={COLORS.primary}>Log in</StyledText>
            </StyledText>
          </StyledPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledPage>
  );
}
