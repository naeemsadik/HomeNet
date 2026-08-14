import { House } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";
import { AppLink } from "./ui";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <AppLink href="/" accessibilityLabel="HomeNet home" style={styles.link}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <House color={colors.white} size={compact ? 16 : 20} strokeWidth={1.7} />
      </View>
      <Text style={[styles.text, compact && styles.textCompact]}>Home<Text style={{ color: colors.greenDark, fontSize: 18, letterSpacing: -0.6 }}>net</Text></Text>
    </AppLink>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenDark,
    // borderTopLeftRadius: 50,
    // borderTopRightRadius: 50,
    // borderBottomRightRadius: 50,
    // borderBottomLeftRadius: 50,
    borderRadius: 50,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },
  markCompact: { width: 28, height: 28 },
  text: { color: colors.black, fontFamily: fonts.extraBold, fontSize: 18, letterSpacing: -0.6 },
  textCompact: { fontSize: 15 },
});
