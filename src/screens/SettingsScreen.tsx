import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import {
  User,
  Bell,
  KeyRound,
  Shield,
  LogOut,
  ChevronRight,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { AppChrome } from "@/components/AppChrome";
import { Eyebrow } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, fonts, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

interface SettingsItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingsItem({ icon: Icon, label, description, onPress, destructive }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.settingsIconWrap, destructive && styles.settingsIconWrapDestructive]}>
        <Icon color={destructive ? colorTokens.error : colorTokens.primary} size={18} />
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemLabel, destructive && styles.settingsItemLabelDestructive]}>{label}</Text>
        {description ? <Text style={styles.settingsItemDescription}>{description}</Text> : null}
      </View>
      <ChevronRight color={colorTokens.textMuted} size={16} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const { isPhone } = useResponsive();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Eyebrow>Settings</Eyebrow>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account</Text>
          <SettingsItem
            icon={User}
            label="Edit Profile"
            description="Update your name and avatar"
            onPress={() => router.push("/profile/edit" as any)}
          />
          <SettingsItem
            icon={KeyRound}
            label="Change Password"
            description="Update your password"
            onPress={() => router.push("/profile/change-password" as any)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Properties</Text>
          <SettingsItem
            icon={Building2}
            label="My Properties"
            description="View and manage your listings"
            onPress={() => router.push("/my-properties" as any)}
          />
          <SettingsItem
            icon={Bell}
            label="Notifications"
            description="Manage notification preferences"
            onPress={() => router.push("/notifications" as never)}
          />
        </View>

        {user ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Session</Text>
            <SettingsItem
              icon={LogOut}
              label="Log out"
              destructive
              onPress={handleLogout}
            />
          </View>
        ) : null}
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 30 },
  headerSection: { gap: 6 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colorTokens.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colorTokens.textSecondary, lineHeight: 18 },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.extraBold,
    color: colorTokens.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: colorTokens.backgroundAlt,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.primaryLight,
  },
  settingsIconWrapDestructive: {
    backgroundColor: colorTokens.errorLight,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
  settingsItemLabelDestructive: {
    color: colorTokens.error,
  },
  settingsItemDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
    marginTop: 2,
  },
});
