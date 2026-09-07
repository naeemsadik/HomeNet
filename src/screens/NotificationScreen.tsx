import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { colorTokens, fonts } from "@/theme";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";

export function NotificationScreen() {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="home">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        <View style={styles.headerSection}>
          <Eyebrow>Notifications</Eyebrow>
          <Text style={styles.title}>Stay updated</Text>
          <Text style={styles.subtitle}>
            Property updates, verification status, and community activity.
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
