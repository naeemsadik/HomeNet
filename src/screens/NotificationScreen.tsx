import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppChrome, type ActivePage } from "@/components/AppChrome";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { colorTokens, fonts } from "@/theme";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";

import { useTranslation } from "@/i18n";

export function NotificationScreen({
  activePage = "home",
}: {
  activePage?: ActivePage;
} = {}) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();

  return (
    <AppChrome active={activePage}>
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.headerSection}>
          <Eyebrow>{t("notifications.heading")}</Eyebrow>
          <Text style={styles.title}>{t("notifications.title")}</Text>
          <Text style={styles.subtitle}>
            {t("notifications.subtitle")}
          </Text>
        </View>
        <View style={styles.listSection}>
          <NotificationList />
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  containerPhone: {
    gap: 14,
  },
  headerSection: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  listSection: {
    flex: 1,
  },
});
