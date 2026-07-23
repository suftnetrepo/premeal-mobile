import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Popup, Stack, StyledText, StyledPressable, StyledCheckBox } from "fluent-styles";
import type { MenuItem, ModifierGroup } from "../api/types";
import { formatMoney } from "../lib/format";
import { computeUnitPriceCents, invalidGroups } from "../cart/cart-utils";
import { COLORS } from "../theme/colors";

type Props = {
  visible: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
  onAdd: (selectedOptionIds: string[], quantity: number) => void;
};

export function MenuItemModal({ visible, menuItem, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Fresh selection every time a (possibly different) item opens.
  useEffect(() => {
    if (visible) {
      setSelected([]);
      setQuantity(1);
    }
  }, [visible, menuItem?.id]);

  if (!menuItem) return null;

  const groups = menuItem.modifierGroups ?? [];
  const missing = invalidGroups(menuItem, selected);
  const canAdd = missing.length === 0;
  const totalCents = computeUnitPriceCents(menuItem, selected) * quantity;

  const toggleOption = (group: ModifierGroup, optionId: string) => {
    setSelected((prev) => {
      const isSelected = prev.includes(optionId);
      if (isSelected) return prev.filter((id) => id !== optionId);

      const inGroupIds = group.options.map((o) => o.id);
      if (group.maxSelect === 1) {
        // Single-select group behaves like a radio — swap, don't accumulate.
        return [...prev.filter((id) => !inGroupIds.includes(id)), optionId];
      }
      const currentInGroup = prev.filter((id) => inGroupIds.includes(id)).length;
      if (currentInGroup >= group.maxSelect) return prev; // at the cap, ignore the tap
      return [...prev, optionId];
    });
  };

  return (
    <Popup visible={visible} onClose={onClose} title={menuItem.name} showClose safeAreaBottom>
      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        <Stack paddingHorizontal={20} paddingTop={4} paddingBottom={20} gap={22}>
          {menuItem.description && (
            <StyledText fontSize={14} lineHeight={20} color={COLORS.textMuted}>
              {menuItem.description}
            </StyledText>
          )}

          {groups.map((group) => (
            <Stack key={group.id} gap={4}>
              <Stack
                horizontal
                alignItems="center"
                justifyContent="space-between"
                paddingBottom={8}
              >
                <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>
                  {group.name}
                </StyledText>
                <Stack
                  paddingHorizontal={10}
                  paddingVertical={4}
                  borderRadius={999}
                  backgroundColor={group.minSelect > 0 ? COLORS.primaryLight : COLORS.bgMuted}
                >
                  <StyledText
                    fontSize={11}
                    fontWeight="700"
                    color={group.minSelect > 0 ? COLORS.primary : COLORS.textMuted}
                  >
                    {group.minSelect > 0
                      ? group.minSelect === group.maxSelect
                        ? `Required · ${group.minSelect}`
                        : `Required · ${group.minSelect}-${group.maxSelect}`
                      : "Optional"}
                  </StyledText>
                </Stack>
              </Stack>

              {group.options.map((opt) => {
                const checked = selected.includes(opt.id);
                return (
                  <StyledPressable
                    key={opt.id}
                    horizontal
                    alignItems="center"
                    justifyContent="space-between"
                    paddingVertical={10}
                    onPress={() => opt.isAvailable && toggleOption(group, opt.id)}
                    style={{ opacity: opt.isAvailable ? 1 : 0.4 }}
                  >
                    <Stack horizontal alignItems="center" gap={12} flex={1}>
                      <StyledCheckBox
                        checked={checked}
                        onCheck={() => opt.isAvailable && toggleOption(group, opt.id)}
                        checkedColor={COLORS.primary}
                      />
                      <StyledText fontSize={14} color={COLORS.textPrimary} flex={1}>
                        {opt.name}
                        {!opt.isAvailable ? " (unavailable)" : ""}
                      </StyledText>
                    </Stack>
                    {opt.priceDeltaCents !== 0 && (
                      <StyledText fontSize={14} color={COLORS.textMuted}>
                        {opt.priceDeltaCents > 0 ? "+" : "-"}
                        {formatMoney(Math.abs(opt.priceDeltaCents))}
                      </StyledText>
                    )}
                  </StyledPressable>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </ScrollView>

      <Stack
        paddingHorizontal={20}
        paddingTop={14}
        borderTopWidth={1}
        borderTopColor={COLORS.border}
        gap={14}
      >
        <Stack horizontal alignItems="center" justifyContent="center" gap={20}>
          <StyledPressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            width={36}
            height={36}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            backgroundColor={COLORS.bgMuted}
          >
            <StyledText fontSize={18} fontWeight="700" color={COLORS.textPrimary}>
              −
            </StyledText>
          </StyledPressable>
          <StyledText fontSize={16} fontWeight="700" color={COLORS.textPrimary}>
            {quantity}
          </StyledText>
          <StyledPressable
            onPress={() => setQuantity((q) => q + 1)}
            width={36}
            height={36}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            backgroundColor={COLORS.bgMuted}
          >
            <StyledText fontSize={18} fontWeight="700" color={COLORS.textPrimary}>
              +
            </StyledText>
          </StyledPressable>
        </Stack>

        <StyledPressable
          disabled={!canAdd}
          onPress={() => canAdd && onAdd(selected, quantity)}
          horizontal
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={22}
          paddingVertical={16}
          borderRadius={999}
          backgroundColor={canAdd ? COLORS.primary : COLORS.bgMuted}
        >
          <StyledText fontSize={15} fontWeight="700" color={canAdd ? COLORS.white : COLORS.textMuted}>
            {canAdd ? "Add" : `Select ${missing[0]?.name ?? "options"}`}
          </StyledText>
          <StyledText fontSize={15} fontWeight="700" color={canAdd ? COLORS.white : COLORS.textMuted}>
            {formatMoney(totalCents)}
          </StyledText>
        </StyledPressable>
      </Stack>
    </Popup>
  );
}
