/** Font-family tokens – aligned with Inter and Plus Jakarta Sans variants loaded in _layout.tsx and +html.tsx */
export const fontTokens = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
  headingSemiBold: "PlusJakartaSans_600SemiBold",
  headingBold: "PlusJakartaSans_700Bold",
  headingExtraBold: "PlusJakartaSans_800ExtraBold",
} as const;

export type FontTokens = typeof fontTokens;
