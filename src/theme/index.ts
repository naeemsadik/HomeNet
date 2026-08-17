/**
 * Theme barrel – single import point for the design-token system.
 */

export { colorTokens, type ColorTokens } from "./colors";
export { fontTokens, type FontTokens } from "./fonts";
export { ThemeProvider, useTheme, type Theme, type ThemeProviderProps } from "./ThemeProvider";

import { colorTokens } from "./colors";
import { fontTokens } from "./fonts";
import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  ink: colorTokens.textPrimary,
  black: colorTokens.textBlack,
  muted: colorTokens.textSecondary,
  line: colorTokens.divider,
  soft: colorTokens.backgroundAlt,
  softBlue: colorTokens.verifiedLight,
  green: colorTokens.primary,
  greenDark: colorTokens.primary,
  greenLight: colorTokens.primaryLight,
  blue: colorTokens.verified,
  blueLight: colorTokens.verifiedLight,
  orange: colorTokens.orange,
  orangeLight: colorTokens.orangeLight,
  white: colorTokens.background,
  coral: colorTokens.error,
  sidebar: colorTokens.sidebar,
} as const;

export const fonts = fontTokens;

export const shadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
};

export const textBase: TextStyle = {
  color: colorTokens.textPrimary,
  fontFamily: fontTokens.regular,
};

export const webPointer = { cursor: "pointer" } as ViewStyle;

export function columnsWidth(columns: number, gap: number) {
  return `${(100 - ((columns - 1) * gap * 100) / 1180) / columns}%` as const;
}
