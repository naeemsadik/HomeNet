import React, { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "@/components/icons";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { useUnreadCount } from "@/features/notification/hooks/useNotifications";
import { hasAnyAdminPermission } from "@/lib/permissions";
import { colorTokens, fontTokens, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { AdminTabNav, type AdminTab } from "./AdminTabNav";

export interface AdminShellProps {
  children: ReactNode;
  activeTab: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  backAction?: {
    label: string;
    onPress: () => void;
  };
}

export function AdminShell({ children, activeTab, onTabChange, backAction }: AdminShellProps) {
  const { t } = useTranslation();
  const { isPhone, contentPadding, containerMaxWidth } = useResponsive();
  const userRoles = useAuthStore((s) => s.userRoles);
  const { data: adminUnread } = useUnreadCount("admin");

  const hasAccess = hasAnyAdminPermission(userRoles);

  function handleTabChange(tab: AdminTab) {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      router.push({ pathname: "/admin", params: { tab } });
    }
  }

  if (!hasAccess) {
    return (
      <AppChrome active="home">
        <View style={styles.denied}>
          <Text style={styles.deniedTitle}>{t("admin.accessDenied")}</Text>
          <Text style={styles.deniedText}>{t("admin.accessDeniedDesc")}</Text>
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome active="home">
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: contentPadding,
            maxWidth: containerMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
          isPhone && styles.containerPhone,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {backAction ? (
          <View style={styles.backBarWrap}>
            <Pressable
              onPress={backAction.onPress}
              style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.backBarBtn,
                hovered && styles.backBarBtnHovered,
                pressed && styles.backBarBtnPressed,
                webPointer,
              ]}
              accessibilityRole="button"
              accessibilityLabel={backAction.label}
            >
              <ArrowLeft color={colorTokens.brand} size={15} strokeWidth={2.2} />
              <Text style={styles.backBarText}>{backAction.label}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.headerSection}>
          <Eyebrow>{t("admin.eyebrow")}</Eyebrow>
          <Text style={styles.title}>{t("admin.dashboardTitle")}</Text>
          <Text style={styles.subtitle}>{t("admin.dashboardSubtitle")}</Text>
        </View>

        <AdminTabNav
          active={activeTab}
          onChange={handleTabChange}
          userRoles={userRoles}
          badges={{ notifications: adminUnread?.data?.count ?? 0 }}
        />

        <View style={styles.tabContent}>{children}</View>
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },
  containerPhone: {
    gap: 14,
    paddingTop: 4,
    paddingBottom: 32,
  },
  backBarWrap: {
    paddingBottom: 2,
  },
  backBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
  },
  backBarBtnHovered: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brand,
  },
  backBarBtnPressed: {
    opacity: 0.8,
  },
  backBarText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  headerSection: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  tabContent: {
    marginTop: 4,
  },
  denied: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  deniedTitle: {
    fontSize: 20,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  deniedText: {
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
});
