import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  ink: "#132820",
  muted: "#687b73",
  line: "#E4EBE7",
  soft: "#F4F8F6",
  softBlue: "#F0F5FB",
  green: "#087A5B",
  greenDark: "#075C46",
  greenLight: "#E5F4ED",
  blue: "#3B63C7",
  orange: "#E9A452",
  white: "#FFFFFF",
  coral: "#D7655A",
  sidebar: "#FBFDFC",
} as const;

export const fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
} as const;

export const shadow: ViewStyle = {
  shadowColor: "#1A352B",
  shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.09,
  shadowRadius: 24,
  elevation: 5,
};

export const textBase: TextStyle = {
  color: colors.ink,
  fontFamily: fonts.regular,
};

export const webPointer = { cursor: "pointer" } as ViewStyle;

export function columnsWidth(columns: number, gap: number) {
  return `${(100 - ((columns - 1) * gap * 100) / 1180) / columns}%` as const;
}
