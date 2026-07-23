import { useState } from "react";
import { ActivityIndicator, FlatList, TextInput } from "react-native";
import { router } from "expo-router";
import { StyledPage, StyledHeader, Stack, StyledText, StyledPressable, StyledCard } from "fluent-styles";
import { useAddresses, useCreateAddress, useSetDefaultAddress, useDeleteAddress } from "../../src/hooks/useAddresses";
import { COLORS } from "../../src/theme/colors";

export default function AddressesScreen() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const deleteAddress = useDeleteAddress();
  const [newAddress, setNewAddress] = useState("");

  return (
    <StyledPage flex={1} backgroundColor={COLORS.bg}>
      <StyledHeader
        title="Addresses"
        titleAlignment="center"
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={COLORS.bgCard}
        showStatusBar statusBarProps={{ barStyle: "dark-content" }}
        borderBottomWidth={0.5}
        borderBottomColor={COLORS.border}
      />

      {isLoading ? (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </Stack>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <StyledCard shadow="light" borderRadius={14} backgroundColor={COLORS.bgCard} borderWidth={0.5} borderColor={COLORS.border} padding={14}>
              <Stack horizontal justifyContent="space-between" alignItems="center" gap={10}>
                <Stack horizontal alignItems="flex-start" gap={10} flex={1}>
                  <Stack width={36} height={36} borderRadius={10} backgroundColor={item.isDefault ? COLORS.primaryLight : COLORS.bgMuted} alignItems="center" justifyContent="center" flexShrink={0}>
                    <StyledText fontSize={16}>{item.isDefault ? "📍" : "🗺️"}</StyledText>
                  </Stack>
                  <Stack flex={1} gap={2}>
                    <Stack horizontal alignItems="center" gap={6}>
                      <StyledText fontSize={14} fontWeight="700" color={COLORS.textPrimary}>
                        {item.label ?? "Address"}
                      </StyledText>
                      {item.isDefault && (
                        <Stack backgroundColor={COLORS.primaryLight} borderRadius={999} paddingHorizontal={7} paddingVertical={2}>
                          <StyledText fontSize={10} fontWeight="700" color={COLORS.primary}>Default</StyledText>
                        </Stack>
                      )}
                    </Stack>
                    <StyledText fontSize={13} color={COLORS.textMuted}>{item.address}</StyledText>
                  </Stack>
                </Stack>
                <Stack gap={8} alignItems="flex-end">
                  {!item.isDefault && (
                    <StyledPressable onPress={() => setDefaultAddress.mutate(item.id)}>
                      <StyledText fontSize={12} fontWeight="600" color={COLORS.primary}>Set default</StyledText>
                    </StyledPressable>
                  )}
                  <StyledPressable onPress={() => deleteAddress.mutate(item.id)}>
                    <StyledText fontSize={12} fontWeight="600" color={COLORS.error}>Delete</StyledText>
                  </StyledPressable>
                </Stack>
              </Stack>
            </StyledCard>
          )}
          ListEmptyComponent={
            <Stack alignItems="center" paddingTop={60} gap={8}>
              <StyledText fontSize={40}>📍</StyledText>
              <StyledText fontSize={15} fontWeight="700" color={COLORS.textPrimary}>No saved addresses</StyledText>
              <StyledText fontSize={14} color={COLORS.textMuted} textAlign="center">Add your first address below.</StyledText>
            </Stack>
          }
          ListFooterComponent={
            <Stack gap={10} paddingTop={10}>
              <TextInput
                placeholder="Add a new address"
                placeholderTextColor={COLORS.textMuted}
                value={newAddress}
                onChangeText={setNewAddress}
                style={{
                  borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
                  color: COLORS.textPrimary, backgroundColor: COLORS.bgCard,
                }}
              />
              <StyledPressable
                onPress={() => createAddress.mutate({ address: newAddress }, { onSuccess: () => setNewAddress("") })}
                disabled={!newAddress.trim() || createAddress.isPending}
                alignItems="center"
                paddingVertical={16}
                borderRadius={999}
                backgroundColor={newAddress.trim() ? COLORS.primary : COLORS.bgMuted}
              >
                {createAddress.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <StyledText fontSize={15} fontWeight="700" color={newAddress.trim() ? COLORS.white : COLORS.textMuted}>
                    Add address
                  </StyledText>
                )}
              </StyledPressable>
            </Stack>
          }
        />
      )}
    </StyledPage>
  );
}
