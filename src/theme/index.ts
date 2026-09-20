/**
 * Theme barrel – single import point for the design-token system.
 */

export { colorTokens, type ColorTokens } from "./colors";
export { fontTokens, type FontTokens } from "./fonts";
export { radiusTokens, type RadiusTokens } from "./radius";
export { layoutTokens, type LayoutTokens } from "./layout";
export { ThemeProvider, useTheme, type Theme, type ThemeProviderProps } from "./ThemeProvider";

import { colorTokens } from "./colors";
import { fontTokens } from "./fonts";
import { radiusTokens } from "./radius";
import { layoutTokens } from "./layout";
import { Platform, type TextStyle, type ViewStyle } from "react-native";

/**
 * Shorthand aliases over `colorTokens`. Same roles, shorter names.
 * New code should prefer the role names on `colorTokens` directly.
 */
export const colors = {
  ink: colorTokens.ink,
  black: colorTokens.ink,
  body: colorTokens.body,
  muted: colorTokens.muted,
  subtle: colorTokens.subtle,
  line: colorTokens.divider,
  soft: colorTokens.canvas,
  sunken: colorTokens.surfaceSunken,
  softBlue: colorTokens.infoSurface,
  /** Fill only — see `greenOnLight` for text. */
  green: colorTokens.brand,
  /** Was identical to `green`, so every "dark" state was a no-op. */
  greenDark: colorTokens.brandHover,
  greenLight: colorTokens.brandSurface,
  greenOnLight: colorTokens.brandText,
  blue: colorTokens.info,
  blueLight: colorTokens.infoSurface,
  orange: colorTokens.notification,
  orangeLight: colorTokens.notificationSurface,
  warning: colorTokens.warningText,
  warningLight: colorTokens.warningSurface,
  white: colorTokens.surface,
  /** Now a real red rather than the shared orange. */
  coral: colorTokens.errorText,
  error: colorTokens.errorText,
  errorLight: colorTokens.errorSurface,
  sidebar: colorTokens.surface,
} as const;

export const fonts = fontTokens;

export const radius = radiusTokens;

export const layout = layoutTokens;

export const shadow: ViewStyle = Platform.select({
  web: {
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
  } as ViewStyle,
  default: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
}) as ViewStyle;

export const textBase: TextStyle = {
  color: colorTokens.textPrimary,
  fontFamily: fontTokens.regular,
};

export const webPointer = { cursor: "pointer" } as ViewStyle;

export function columnsWidth(columns: number, gap: number) {
  return `${(100 - ((columns - 1) * gap * 100) / 1180) / columns}%` as const;
}
