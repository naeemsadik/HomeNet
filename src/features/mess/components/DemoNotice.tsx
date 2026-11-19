import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { MESS_DEMO } from "@/lib/features";
import { colorTokens, fonts, layout, radius } from "@/theme";

/**
 * Shown on every Mess & Seat Share page while it runs on sample listings: they are not
 * real, nothing posted is kept, and no number in them belongs to anyone. Renders nothing
 * once the page is on the real API.
 */
export function DemoNotice() {
  const { t } = useTranslation();
  if (!MESS_DEMO) return null;
  return (
    <View accessibilityRole="alert" style={styles.wrap}>
      <View style={styles.box}>
        <AlertCircle color={colorTokens.warningText} size={18} strokeWidth={2} />
        <View style={styles.text}>
          <Text style={styles.title}>{t("mess.demo.title")}</Text>
          <Text style={styles.body}>{t("mess.demo.notice")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 1040, alignSelf: "center", paddingHorizontal: layout.gutter, paddingTop: 16 },
  box: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colorTokens.warningSurface,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20, color: colorTokens.warningText },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colorTokens.body },
});
