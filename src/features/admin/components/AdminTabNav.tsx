import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Building2, MapPinned, Settings, ShieldCheck, Users } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import type { UserRole } from "../types/admin";

type AdminTab = "properties" | "notifications" | "users" | "roles" | "areas" | "settings";

interface AdminTabNavProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  userRoles: UserRole[];
  /** Counts shown beside a tab's label, e.g. unread notifications. */
  badges?: Partial<Record<AdminTab, number>>;
}

const TABS: {
  key: AdminTab;
  label: string;
  icon: typeof Building2;
  permissions?: string[];
}[] = [
  { key: "properties", label: "Properties", icon: Building2, permissions: ["manage_properties", "moderate_listing", "review_verification"] },
  // The API sends admin notifications to holders of moderate_listing. Not
  // manage_properties: every buyer_seller account has that one.
  { key: "notifications", label: "Notifications", icon: Bell, permissions: ["moderate_listing"] },
  { key: "users", label: "Users", icon: Users, permissions: ["manage_users"] },
  { key: "roles", label: "Roles", icon: ShieldCheck, permissions: ["view_roles", "manage_roles"] },
  { key: "areas", label: "Areas", icon: MapPinned, permissions: ["manage_areas"] },
  { key: "settings", label: "Settings", icon: Settings },
];

function hasPermission(userRoles: UserRole[], permission: string): boolean {
  return userRoles.some((ur) =>
    ur.role.role_permissions?.some((rp) => rp.permission.name === permission),
  );
}

function isAdmin(userRoles: UserRole[]): boolean {
  return userRoles.some((ur) => ur.role.name === "admin" || ur.role.name === "superadmin");
}

export function AdminTabNav({ active, onChange, userRoles, badges }: AdminTabNavProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (!tab.permissions) return true;
    return isAdmin(userRoles) || tab.permissions.some((permission) => hasPermission(userRoles, permission));
  });

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        const count = badges?.[tab.key] ?? 0;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            accessibilityLabel={count > 0 ? `${tab.label} tab, ${count} unread` : `${tab.label} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon color={isActive ? colorTokens.onBrand : colorTokens.textSecondary} size={16} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {count > 0 ? (
              <View style={[styles.count, isActive && styles.countActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {count > 99 ? "99+" : count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.errorText,
  },
  countActive: { backgroundColor: colorTokens.surface },
  countText: {
    color: colorTokens.onDanger,
    fontFamily: fontTokens.bold,
    fontSize: 10.5,
  },
  countTextActive: { color: colorTokens.errorText },
  container: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  tabActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  tabTextActive: {
    color: colorTokens.onBrand,
  },
});
