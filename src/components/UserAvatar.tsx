import { Image, Text, View, type ImageStyle, type StyleProp } from "react-native";
import { colorTokens, fonts } from "@/theme";

/** Up to two letters from a name: "Rahim Uddin" → "RU", "Rahim" → "R". */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  // Array.from keeps a Bangla letter and its vowel sign together better than [0] on the string.
  const first = (word: string) => Array.from(word)[0] ?? "";
  const letters = words.length === 1 ? first(words[0]) : first(words[0]) + first(words[words.length - 1]);
  return letters.toUpperCase();
}

/**
 * A person's photo, or their initials on a mint circle when they have none.
 * Never a stock photo: a stranger's face read as someone else's account.
 *
 * `size` sets the default width and height and scales the initials; `style`
 * can make it fill a sized wrapper instead (width and height "100%").
 */
export function UserAvatar({
  uri,
  name,
  size,
  style,
}: {
  uri: string | null | undefined;
  name: string | null | undefined;
  size: number;
  style?: StyleProp<ImageStyle>;
}) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image accessibilityIgnoresInvertColors source={{ uri }} style={[box, style]} />;
  }
  return (
    <View
      style={[
        box,
        { alignItems: "center", justifyContent: "center", backgroundColor: colorTokens.brandSurface },
        style as object,
      ]}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: Math.max(10, Math.round(size * 0.4)), color: colorTokens.brandText }}>
        {initialsOf(name) || "?"}
      </Text>
    </View>
  );
}
