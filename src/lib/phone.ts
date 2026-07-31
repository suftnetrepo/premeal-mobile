import { Linking } from "react-native";

// Keeps a leading "+" (international format) plus digits only, dropping
// spaces/dashes/parentheses — accepts both "07407022723" and
// "+447407022723" shaped numbers from the backend.
function sanitizePhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^0-9]/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export type CallResult = { ok: true } | { ok: false; message: string };

// Wraps Linking.canOpenURL/openURL so a missing number, an invalid number,
// or a device that can't place calls (the iOS Simulator, most tablets)
// never throws — every outcome is returned, not thrown, so callers can
// show a toast instead of hitting an unhandled promise rejection.
export async function callPhoneNumber(rawNumber: string | null | undefined): Promise<CallResult> {
  const sanitized = rawNumber ? sanitizePhoneNumber(rawNumber) : "";
  if (!sanitized.replace("+", "")) {
    return { ok: false, message: "Restaurant phone number is unavailable." };
  }

  const url = `tel:${sanitized}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return { ok: false, message: "Calling is unavailable on this device." };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch (err) {
    console.warn("callPhoneNumber: Linking failed", err);
    return { ok: false, message: "Calling is unavailable on this device." };
  }
}
