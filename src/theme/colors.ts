/**
 * HomeNet color tokens.
 *
 * Every colour used across the app should come from this palette so a future
 * dark-mode toggle only needs to swap this single object.
 */
export const colorTokens = {
  // ─── Backgrounds ────────────────────────────────────────────────────────
  background: "#FFFFFF",
  backgroundAlt: "#F4F8F6",
  sidebar: "#FBFDFC",

  // ─── Cards / Surfaces ───────────────────────────────────────────────────
  card: "#FFFFFF",
  cardBorder: "#E4EBE7",
  cardHover: "#F4F8F6",

  // ─── Text ───────────────────────────────────────────────────────────────
  textPrimary: "#132820",
  textSecondary: "#687B73",
  textInverse: "#FFFFFF",
  textMuted: "#9BADA3",
  textBlack: "#0B1A17",

  // ─── Primary Accent (teal/green) ────────────────────────────────────────
  primary: "#087A5B",
  primaryDark: "#075C46",
  primaryLight: "#E5F4ED",
  primaryText: "#FFFFFF",

  // ─── Verified Badge ─────────────────────────────────────────────────────
  verified: "#3B63C7",
  verifiedLight: "#F0F5FB",

  // ─── Error / Danger ─────────────────────────────────────────────────────
  error: "#D7655A",
  errorLight: "#FDF0EE",
  errorDark: "#B5453A",

  // ─── Warning ────────────────────────────────────────────────────────────
  warning: "#E9A452",
  warningLight: "#FEF6E9",

  // ─── Misc ───────────────────────────────────────────────────────────────
  divider: "#E4EBE7",
  overlay: "rgba(19,40,32,0.45)",
  shadow: "#1A352B",
} as const;

export type ColorTokens = typeof colorTokens;
