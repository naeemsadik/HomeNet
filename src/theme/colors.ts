/**
 * HomeNet colour roles.
 *
 * Tokens are named for the JOB they do, not what they look like. If you cannot
 * say which role a colour plays, it does not belong here — and a raw hex does
 * not belong in a component.
 *
 * Three rules this file exists to enforce:
 *
 * 1. `brand` (#04cf92) measures 2.03:1 on white. It is a FILL. Any brand-coloured
 *    text or icon uses `brandText` (#0F6D55, 6.3:1).
 * 2. One role, one colour. `error`, `warning` and `notification` were previously
 *    all #F4823A, which made a validation failure indistinguishable from a
 *    badge. They are now distinct.
 * 3. Declare elevation once — `divider` OR `shadow`, never both on one surface.
 */
export const colorTokens = {
  // ─── Brand ──────────────────────────────────────────────────────────────
  /** Fills, large graphics, active indicators. Never text. */
  brand: "#04cf92",
  brandHover: "#03b57f",
  brandPressed: "#03a675",
  /** Brand-coloured text and icons. 6.29:1 on white. */
  brandText: "#0F6D55",
  brandSurface: "#E6FAF4",
  brandBorder: "#C4E4D5",

  // ─── Neutrals — most of the interface ───────────────────────────────────
  ink: "#0B1A17",
  body: "#2C3E38",
  muted: "#5C6B66",
  /** Disabled text and icons only. Never body copy. */
  subtle: "#8C9A95",
  divider: "rgba(11, 26, 23, 0.08)",
  canvas: "#F8FAF9",
  surface: "#FFFFFF",
  /** Inputs, wells, inset areas. */
  surfaceSunken: "#F4F6F5",

  // ─── Semantic ───────────────────────────────────────────────────────────
  success: "#0F6D55",
  successSurface: "#E6FAF4",
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
  notification: "#F4823A",
  notificationSurface: "#FDEEE2",

  // ─── Fixed ──────────────────────────────────────────────────────────────
  onBrand: "#FFFFFF",
  onInk: "#FFFFFF",
  overlay: "rgba(11, 26, 23, 0.45)",
  shadow: "rgba(11, 26, 23, 0.10)",

  // ─── Legacy aliases ─────────────────────────────────────────────────────
  // Kept so ~420 existing call sites keep compiling while components migrate.
  // Values are remapped to the correct role, so the semantic fixes land now.
  // Prefer the role names above in new code.
  background: "#FFFFFF",
  backgroundAlt: "#F8FAF9",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "rgba(11, 26, 23, 0.08)",
  cardHover: "#F8FAF9",
  textPrimary: "#0B1A17",
  textSecondary: "#5C6B66",
  textInverse: "#FFFFFF",
  textMuted: "#5C6B66",
  textBlack: "#0B1A17",
  primary: "#04cf92",
  primaryDark: "#03b57f",
  primaryLight: "#E6FAF4",
  primaryText: "#FFFFFF",
  primaryOnLight: "#0F6D55",
  verified: "#2251D6",
  verifiedLight: "#E8EEFC",
  orange: "#F4823A",
  orangeLight: "#FDEEE2",
  /** Was #F4823A — now a real red, so 24 error call sites read correctly. */
  error: "#D4183D",
  errorLight: "#FDECEF",
  errorDark: "#B01031",
  /** Was #F4823A — now amber, distinct from error. */
  warning: "#B45309",
  warningLight: "#FFFBEB",
} as const;

export type ColorTokens = typeof colorTokens;
