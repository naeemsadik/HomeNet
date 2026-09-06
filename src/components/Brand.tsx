import { Home } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { AppLink } from "./ui";

export function Brand({
  compact = false,
  size = "default",
}: {
  compact?: boolean;
  size?: "compact" | "default" | "large";
}) {
  const isLarge = size === "large";
  const isCompact = compact || size === "compact";

  return (
    <AppLink href="/" accessibilityLabel="HomeNet home" style={styles.link}>
      <View
        style={[
          styles.mark,
          isCompact && styles.markCompact,
          isLarge && styles.markLarge,
        ]}
      >
        <Home
          color={colors.white}
          size={isCompact ? 16 : isLarge ? 22 : 20}
          strokeWidth={2}
        />
      </View>
      <Text
        style={[
          styles.text,
          isCompact && styles.textCompact,
          isLarge && styles.textLarge,
        ]}
      >
        Home<Text style={{ color: "#0F6D55" }}>net</Text>
      </Text>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6D55",
  },
  markCompact: { width: 28, height: 28, borderRadius: 14 },
  markLarge: { width: 40, height: 40, borderRadius: 20 },
  text: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 18,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  textCompact: { fontSize: 15 },
  textLarge: { fontSize: 20.5, letterSpacing: -0.4 },
});
