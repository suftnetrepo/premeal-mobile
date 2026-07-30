import type { MenuItem, ModifierGroup } from "../api/types";

// Flat delivery fee — mirrors DELIVERY_FEE_CENTS in premeal-app/src/lib/capacity.ts.
// Mobile has no /subscriptions endpoint to check for a fee waiver, so this
// is shown as an estimate on the basket and checkout screens; the order the
// server actually creates is the source of truth for the final charge.
export const ESTIMATED_DELIVERY_FEE_CENTS = 300;

/** Base price + sum of selected options' deltas — one unit, before quantity. */
export function computeUnitPriceCents(menuItem: MenuItem, selectedOptionIds: string[]): number {
  const allOptions = (menuItem.modifierGroups ?? []).flatMap((g) => g.options);
  const deltaSum = selectedOptionIds.reduce((sum, id) => {
    const opt = allOptions.find((o) => o.id === id);
    return sum + (opt?.priceDeltaCents ?? 0);
  }, 0);
  return menuItem.priceCents + deltaSum;
}

/**
 * Mirrors the [minSelect, maxSelect] range check in premeal-app's
 * src/lib/capacity.ts (createOrder -> InvalidModifierSelectionError) so the
 * "Add" button only ever enables when the order would actually be accepted.
 */
export function invalidGroups(menuItem: MenuItem, selectedOptionIds: string[]): ModifierGroup[] {
  const groups = menuItem.modifierGroups ?? [];
  return groups.filter((g) => {
    const countInGroup = g.options.filter((o) => selectedOptionIds.includes(o.id)).length;
    return countInGroup < g.minSelect || countInGroup > g.maxSelect;
  });
}

export function isSelectionValid(menuItem: MenuItem, selectedOptionIds: string[]): boolean {
  return invalidGroups(menuItem, selectedOptionIds).length === 0;
}

/** Comma-joined option names for a selection — used for basket line subtext. */
export function summarizeSelection(menuItem: MenuItem, selectedOptionIds: string[]): string {
  const names: string[] = [];
  for (const group of menuItem.modifierGroups ?? []) {
    for (const opt of group.options) {
      if (selectedOptionIds.includes(opt.id)) names.push(opt.name);
    }
  }
  return names.join(", ");
}
