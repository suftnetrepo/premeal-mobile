/**
 * Brand tokens — lifted from premeal-app/src/app/globals.css and the
 * Tailwind classes actually used on the web homepage (orange-600 / stone-*),
 * so the mobile app reads as the same brand rather than an independent
 * reskin. Flat hex, no theming system — this app has one brand, one look.
 */
export const COLORS = {
  primary: "#EA580C", // orange-600
  primaryDark: "#C2410C", // orange-700
  primaryLight: "#FFF7ED", // orange-50
  success: "#16A34A", // green-600
  successLight: "#F0FDF4", // green-50
  error: "#DC2626", // red-600
  errorLight: "#FEF2F2", // red-50
  warning: "#D97706", // amber-600
  warningLight: "#FFFBEB", // amber-50
  textPrimary: "#1C1917", // stone-900
  textSecondary: "#57534E", // stone-600
  textMuted: "#78716C", // stone-500
  border: "#E7E5E4", // stone-200
  bg: "#FAFAF9", // stone-50
  bgCard: "#FFFFFF",
  bgMuted: "#F5F5F4", // stone-100
  white: "#FFFFFF",
} as const;
