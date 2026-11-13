// theme.ts — single source of truth for the promo.
// Colours are copied verbatim from the app's design tokens (src/theme/colors.ts,
// `colorTokens`) so the video matches the product. Never inline a hex elsewhere.
import { Easing } from "remotion";

export const colorTokens = {
  brand: "#04cf92",
  brandHover: "#03b57f",
  brandText: "#0F6D55",
  brandSurface: "#E6FAF4",
  brandBorder: "#C4E4D5",
  ink: "#0B1A17",
  body: "#2C3E38",
  muted: "#5C6B66",
  subtle: "#8C9A95",
  divider: "rgba(11, 26, 23, 0.08)",
  canvas: "#F8FAF9",
  surface: "#FFFFFF",
  surfaceSunken: "#F4F6F5",
  warningText: "#B45309",
  warningSurface: "#FFFBEB",
  errorText: "#D4183D",
  errorSurface: "#FDECEF",
  info: "#2251D6",
  infoSurface: "#E8EEFC",
  notification: "#F4823A",
  notificationSurface: "#FDEEE2",
  onBrand: "#0B1A17",
  onInk: "#FFFFFF",
  shadow: "rgba(11, 26, 23, 0.10)",
  /** The app's WhatsApp contact button fill (see `onAccent` note in colors.ts). */
  whatsapp: "#25D366",
} as const;

export const theme = {
  colors: {
    ...colorTokens,
    // Video-only tints derived from the tokens above.
    inkRaised: "#13261F",
    inkLine: "rgba(255, 255, 255, 0.08)",
    onInkDim: "rgba(255, 255, 255, 0.62)",
    brandGlow: "rgba(4, 207, 146, 0.35)",
  },
  fonts: {
    /** Display Bangla face (headlines). */
    display: "AnekBangla",
    /** Body / UI Bangla face. */
    body: "NotoSansBengali",
  },
  /** Mirrors the app's `fonts.semiBold` / `fonts.bold` roles as numeric weights. */
  weight: { regular: 400, medium: 500, semiBold: 600, bold: 700, extraBold: 800 },
  /** Bengali conjuncts and matras need room above and below the x-height. */
  lineHeight: { display: 1.42, body: 1.6 },
  radius: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12, card: 6, pill: 999 },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
  shadow: {
    card: "0 1px 2px rgba(11,26,23,0.06), 0 24px 48px -18px rgba(11,26,23,0.22)",
    float: "0 2px 6px rgba(11,26,23,0.08), 0 40px 80px -24px rgba(11,26,23,0.35)",
    dark: "0 40px 90px -30px rgba(0,0,0,0.7)",
  },
} as const;

export type Theme = typeof theme;
