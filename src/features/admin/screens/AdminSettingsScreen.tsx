import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useTranslation } from "@/i18n";

export function AdminSettingsScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>{t("admin.settingsComingSoon")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  text: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
});
