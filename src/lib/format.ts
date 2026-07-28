/** Formats an integer cents amount as GBP — e.g. 1250 -> "£12.50". Mirrors src/lib/format.ts in premeal-app. */
export function formatMoney(cents: number): string {
  return `£${(cents / 100).toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
