import { useState } from "react";
import { TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { StyledPage, Stack, StyledPressable, Spinner } from "fluent-styles";
import { Text } from "../../src/components/text";
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
    <StyledPage flex={1} backgroundColor={COLORS.bg} showStatusBar statusBarProps={{ barStyle: "dark-content" }}>
      <StyledPage.Header backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }} keyboardShouldPersistTaps="handled">
          <Stack gap={6} marginBottom={32}>
            <Text variant="display" color={COLORS.primary}>Pre-Meal</Text>
            <Text fontSize={26} fontWeight="800" color={COLORS.textPrimary}>Create account</Text>
            <Text variant="body" color={COLORS.textMuted}>Order ahead, eat on time.</Text>
          </Stack>

          <Stack gap={14}>
            {[
              { label: "Name",     value: name,     set: setName,     placeholder: "Your name",         secure: false, keyboard: "default" as const },
              { label: "Email",    value: email,    set: setEmail,    placeholder: "you@example.com",    secure: false, keyboard: "email-address" as const },
              { label: "Password", value: password, set: setPassword, placeholder: "8+ characters",       secure: true,  keyboard: "default" as const },
            ].map((field) => (
              <Stack key={field.label} gap={6}>
                <Text fontSize={13} fontWeight="600" color={COLORS.textSecondary}>{field.label}</Text>
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
              <Text fontSize={16} fontWeight="700" color={canSubmit ? COLORS.white : COLORS.textMuted}>Create account</Text>
            )}
          </StyledPressable>

          <StyledPressable alignItems="center" paddingVertical={16} onPress={() => router.push("/login")}>
            <Text variant="body" color={COLORS.textMuted}>
              Already have an account?{" "}
              <Text fontSize={14} fontWeight="700" color={COLORS.primary}>Log in</Text>
            </Text>
          </StyledPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledPage>
  );
}
