/**
 * Theme barrel – single import point for the design-token system.
 *
 * Usage:
 *   import { ThemeProvider, useTheme, colorTokens, fontTokens } from "@/theme";
 *
 * The legacy `colors`, `fonts`, `shadow`, `textBase`, `webPointer`, and
 * `columnsWidth` exports from the old `src/theme.ts` are re-exported here
 * so existing component imports (`import { colors } from "@/theme"`) keep
 * working without any changes.
 */

// ─── New theme system ──────────────────────────────────────────────────────
export { colorTokens, type ColorTokens } from "./colors";
export { fontTokens, type FontTokens } from "./fonts";
export { ThemeProvider, useTheme, type Theme, type ThemeProviderProps } from "./ThemeProvider";

// ─── Legacy re-exports (backward-compatible) ──────────────────────────────
// Maps the old named exports to the new token objects so every file that
// imports `colors`, `fonts`, etc. from "@/theme" keeps compiling.
import { colorTokens } from "./colors";
import { fontTokens } from "./fonts";
import type { TextStyle, ViewStyle } from "react-native";

/** @deprecated Use `colorTokens` via `useTheme().colors` instead. */
export const colors = {
  ink: colorTokens.textPrimary,
  muted: colorTokens.textSecondary,
  line: colorTokens.divider,
  soft: colorTokens.backgroundAlt,
  softBlue: colorTokens.verifiedLight,
  green: colorTokens.primary,
  greenDark: colorTokens.primaryDark,
  greenLight: colorTokens.primaryLight,
  blue: colorTokens.verified,
  orange: colorTokens.warning,
  white: colorTokens.background,
  coral: colorTokens.error,
  sidebar: colorTokens.sidebar,
} as const;

/** @deprecated Use `fontTokens` via `useTheme().fonts` instead. */
export const fonts = fontTokens;

/** @deprecated Use `useTheme().shadow` instead. */
export const shadow: ViewStyle = {
  shadowColor: colorTokens.shadow,
  shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.09,
  shadowRadius: 24,
  elevation: 5,
};

/** @deprecated Use `useTheme().textBase` instead. */
export const textBase: TextStyle = {
  color: colorTokens.textPrimary,
  fontFamily: fontTokens.regular,
};

/** @deprecated Use `useTheme().webPointer` instead. */
export const webPointer = { cursor: "pointer" } as ViewStyle;

/** Grid helper – unchanged. */
export function columnsWidth(columns: number, gap: number) {
  return `${(100 - ((columns - 1) * gap * 100) / 1180) / columns}%` as const;
}
