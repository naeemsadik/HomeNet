import { router } from "expo-router";
import Head from "expo-router/head";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PageMeta } from "@/components/PageMeta";
import { AppButton } from "@/components/ui";
import { colorTokens, fonts } from "@/theme";

/**
 * The one "page not found" view. Unknown URLs render it, and so do staff-only
 * pages opened by someone without access (see RequirePermission). Answering
 * both the same way avoids confirming that a staff page exists.
 */
import { useTranslation } from "@/i18n";

/**
 * The one "page not found" view. Unknown URLs render it, and so do staff-only
 * pages opened by someone without access (see RequirePermission). Answering
 * both the same way avoids confirming that a staff page exists.
 */
export function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <AppChrome active="home">
      <PageMeta title={t("notFound.metaTitle")} />
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.center}>
        <Text style={styles.code}>{t("notFound.code")}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {t("notFound.title")}
        </Text>
        <Text style={styles.copy}>
          {t("notFound.copy")}
        </Text>
        <View style={styles.actions}>
          <AppButton label={t("notFound.goHome")} onPress={() => router.push("/")} />
          <AppButton
            label={t("notFound.browseHomes")}
            variant="secondary"
            onPress={() => router.push("/buy")}
          />
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  code: {
    color: colorTokens.brandText,
    fontFamily: fonts.headingExtraBold,
    fontSize: 64,
    letterSpacing: -2,
    lineHeight: 68,
  },
  title: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 24,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  copy: {
    maxWidth: 380,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },
});
