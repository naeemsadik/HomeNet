/**
 * HomeNet color tokens matching Figma design exactly.
 */
export const colorTokens = {
  // ─── Backgrounds ────────────────────────────────────────────────────────
  background: "#FFFFFF",
  backgroundAlt: "#F8FAF9",
  sidebar: "#FFFFFF",

  // ─── Cards / Surfaces ───────────────────────────────────────────────────
  card: "#FFFFFF",
  cardBorder: "rgba(11, 26, 23, 0.08)",
  cardHover: "#F8FAF9",

  // ─── Text ───────────────────────────────────────────────────────────────
  textPrimary: "#0B1A17",
  textSecondary: "#5C6B66",
  textInverse: "#FFFFFF",
  textMuted: "#5C6B66",
  textBlack: "#0B1A17",

  // ─── Primary Accent (Figma Green) ───────────────────────────────────────
  primary: "#0F6D55",
  primaryDark: "#0B5743",
  primaryLight: "#E7F2EE",
  primaryText: "#FFFFFF",

  // ─── Verified / Blue Badge ──────────────────────────────────────────────
  verified: "#2251D6",
  verifiedLight: "#E8EEFC",

  // ─── Orange / Notification / Investment Score Accent ────────────────────
  orange: "#F4823A",
  orangeLight: "#FDEEE2",

  // ─── Error / Danger ─────────────────────────────────────────────────────
  error: "#F4823A",
  errorLight: "#FDEEE2",
  errorDark: "#D96A24",

  // ─── Warning ────────────────────────────────────────────────────────────
  warning: "#F4823A",
  warningLight: "#FDEEE2",

  // ─── Misc ───────────────────────────────────────────────────────────────
  divider: "rgba(11, 26, 23, 0.08)",
  overlay: "rgba(11, 26, 23, 0.45)",
  shadow: "rgba(0, 0, 0, 0.06)",
} as const;

export type ColorTokens = typeof colorTokens;
