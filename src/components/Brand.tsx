import { Home } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { AppLink } from "./ui";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <AppLink href="/" accessibilityLabel="HomeNet home" style={styles.link}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Home color={colors.white} size={compact ? 16 : 20} strokeWidth={2} />
      </View>
      <Text style={[styles.text, compact && styles.textCompact]}>
        Home<Text style={{ color: "#0F6D55" }}>net</Text>
      </Text>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6D55",
  },
  markCompact: { width: 28, height: 28, borderRadius: 14 },
  text: {
    color: "#0B1A17",
    fontFamily: fonts.headingExtraBold,
    fontSize: 18,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  textCompact: { fontSize: 15 },
});
