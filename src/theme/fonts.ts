/** Font-family tokens – aligned with the Manrope variants loaded in _layout.tsx */
export const fontTokens = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
} as const;

export type FontTokens = typeof fontTokens;
