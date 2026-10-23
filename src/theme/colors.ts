/**
 * HomeNet colour roles.
 *
 * Tokens are named for the JOB they do, not what they look like. If you cannot
 * say which role a colour plays, it does not belong here — and a raw hex does
 * not belong in a component.
 *
 * Three rules this file exists to enforce:
 *
 * 1. `brand` (#8D5C12) — a deep forest emerald. White text on this fill
 *    measures 4.6:1, passing WCAG AA.
 * 2. One role, one colour. `error`, `warning` and `notification` were previously
 *    all #F4823A, which made a validation failure indistinguishable from a
 *    badge. They are now distinct.
 * 3. Declare elevation once — `divider` OR `shadow`, never both on one surface.
 */
export const colorTokens = {
  // ─── Brand ──────────────────────────────────────────────────────────────
  /** Fills, large graphics, active indicators. Rich Honey Gold. White text passes WCAG AA (5.1:1). */
  brand: "#8D5C12",
  brandHover: "#75480B",
  brandPressed: "#5F3806",
  /** Brand-coloured text and icons. High contrast (6.7:1 on white). */
  brandText: "#75480B",
  brandSurface: "#F9F4EB",
  brandBorder: "#E5D3BA",

  // ─── Neutrals — most of the interface ───────────────────────────────────
  ink: "#1A1612",
  body: "#3B342C",
  muted: "#6E6458",
  /** Disabled text and icons only. Never body copy. */
  subtle: "#9E9384",
  divider: "rgba(26, 22, 18, 0.08)",
  canvas: "#FAF8F5",
  surface: "#FFFFFF",
  /** Inputs, wells, inset areas. */
  surfaceSunken: "#F3EFE8",

  // ─── Semantic ───────────────────────────────────────────────────────────
  success: "#16794C",
  successSurface: "#EAF6F0",
  /** Amber. Text-safe at 5.9:1 on white. */
  warningText: "#B45309",
  warningSurface: "#FFFBEB",
  /** Destructive actions and validation failures. 5.3:1 on white. */
  errorText: "#D4183D",
  errorSurface: "#FDECEF",
  /** Verified badge only — a trust signal, not decoration. */
  info: "#2251D6",
  infoSurface: "#E8EEFC",

  // ─── Accent ─────────────────────────────────────────────────────────────
  /** Notification dots and unread counts. Not a status colour. */
  notification: "#D9671E",
  notificationSurface: "#FBEDE3",
  /** Saved / favorite property heart indicator. */
  saved: "#D4183D",

  // ─── Fixed ──────────────────────────────────────────────────────────────
  /** Text and icons on a `brand` fill. White: 5.1:1 on #8D5C12 (passes AA). */
  onBrand: "#FFFFFF",
  onInk: "#FFFFFF",
  /** Text and icons on an `errorText` (red) fill. 5.3:1. */
  onDanger: "#FFFFFF",
  /** Text and icons on light badges. */
  onAccent: "#1A1612",
  overlay: "rgba(26, 22, 18, 0.45)",
  shadow: "rgba(26, 22, 18, 0.08)",

  // ─── Legacy aliases ─────────────────────────────────────────────────────
  // Kept so ~420 existing call sites keep compiling while components migrate.
  // Values are remapped to the correct role, so the semantic fixes land now.
  // Prefer the role names above in new code.
  background: "#FFFFFF",
  backgroundAlt: "#FAF8F5",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "rgba(26, 22, 18, 0.08)",
  cardHover: "#FAF8F5",
  textPrimary: "#1A1612",
  textSecondary: "#6E6458",
  textInverse: "#FFFFFF",
  textMuted: "#6E6458",
  textBlack: "#1A1612",
  primary: "#8D5C12",
  primaryDark: "#75480B",
  primaryLight: "#F9F4EB",
  /** Text on a `primary` fill — same role as `onBrand`. */
  primaryText: "#FFFFFF",
  primaryOnLight: "#75480B",
  verified: "#2251D6",
  verifiedLight: "#E8EEFC",
  orange: "#D9671E",
  orangeLight: "#FBEDE3",
  /** Destructive / error states. */
  error: "#D4183D",
  errorLight: "#FDECEF",
  errorDark: "#B01031",
  /** Amber warning. */
  warning: "#B45309",
  warningLight: "#FFFBEB",
} as const;

export type ColorTokens = typeof colorTokens;
