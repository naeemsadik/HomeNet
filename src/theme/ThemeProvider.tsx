import React, { createContext, useContext, useMemo } from "react";
import type { TextStyle, ViewStyle } from "react-native";
import { colorTokens, type ColorTokens } from "./colors";
import { fontTokens, type FontTokens } from "./fonts";

// ─── Theme shape ───────────────────────────────────────────────────────────
export interface Theme {
  colors: ColorTokens;
  fonts: FontTokens;
  shadow: ViewStyle;
  textBase: TextStyle;
  webPointer: ViewStyle;
}

const defaultTheme: Theme = {
  colors: colorTokens,
  fonts: fontTokens,
  shadow: {
    shadowColor: colorTokens.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 5,
  },
  textBase: {
    color: colorTokens.textPrimary,
    fontFamily: fontTokens.regular,
  },
  webPointer: { cursor: "pointer" } as ViewStyle,
};

// ─── Context ───────────────────────────────────────────────────────────────
const ThemeContext = createContext<Theme>(defaultTheme);

// ─── Provider ──────────────────────────────────────────────────────────────
export interface ThemeProviderProps {
  /** Supply a partial override to customise specific tokens (e.g. dark mode). */
  overrides?: Partial<Theme>;
  children: React.ReactNode;
}

export function ThemeProvider({ overrides, children }: ThemeProviderProps) {
  const theme = useMemo<Theme>(() => {
    if (!overrides) return defaultTheme;
    return {
      ...defaultTheme,
      ...overrides,
      colors: { ...defaultTheme.colors, ...overrides.colors },
      fonts: { ...defaultTheme.fonts, ...overrides.fonts },
    };
  }, [overrides]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
