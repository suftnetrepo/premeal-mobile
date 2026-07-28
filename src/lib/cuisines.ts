/**
 * Mirrors MENU_TEMPLATES in premeal-app/src/lib/menu-templates.ts — the
 * mobile app has no access to that server-side file, so this is a small,
 * manually-kept-in-sync duplicate rather than a shared package. Update
 * both lists together if a new template cuisine is ever added on the web
 * side.
 */
export const SUPPORTED_CUISINES = [
  "Japanese",
  "Italian",
  "Indian",
  "West African",
  "Ethiopian",
  "Healthy",
  "American",
] as const;

/** A light, non-food-specific emoji per cuisine — kept simple rather than
 * guessing at food icon names in react-native-vector-icons/Feather,
 * which doesn't actually have dish-specific icons (no "pizza", no
 * "fish"). Used wherever a restaurant has no real uploaded photo, as an
 * honest placeholder instead of a random stock image. */
const CUISINE_EMOJI: Record<string, string> = {
  Japanese: "🍣",
  Italian: "🍕",
  Indian: "🍛",
  "West African": "🍲",
  Ethiopian: "🍲",
  Healthy: "🥗",
  American: "🍔",
};

export function cuisineEmoji(cuisine: string): string {
  return CUISINE_EMOJI[cuisine] ?? "🍽️";
}
