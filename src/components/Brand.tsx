import { House } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { AppLink } from "./ui";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <AppLink href="/" accessibilityLabel="HomeNet home" style={styles.link}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <House color={colors.white} size={compact ? 16 : 18} strokeWidth={2.4} />
      </View>
      <Text style={[styles.text, compact && styles.textCompact]}>HomeNet</Text>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },
  markCompact: { width: 28, height: 28 },
  text: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 17, letterSpacing: -0.8 },
  textCompact: { fontSize: 15 },
});
