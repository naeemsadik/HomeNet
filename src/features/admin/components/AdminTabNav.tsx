import { Pressable, StyleSheet, Text, View } from "react-native";
import { Building2, MapPinned, Settings, ShieldCheck, Users } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import type { UserRole } from "../types/admin";

type AdminTab = "properties" | "users" | "roles" | "areas" | "settings";

interface AdminTabNavProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  userRoles: UserRole[];
}

const TABS: {
  key: AdminTab;
  label: string;
  icon: typeof Building2;
  permissions?: string[];
}[] = [
  { key: "properties", label: "Properties", icon: Building2, permissions: ["manage_properties", "moderate_listing", "review_verification"] },
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

export function AdminTabNav({ active, onChange, userRoles }: AdminTabNavProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (!tab.permissions) return true;
    return isAdmin(userRoles) || tab.permissions.some((permission) => hasPermission(userRoles, permission));
  });

  return (
    <View style={styles.container}>
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            accessibilityLabel={`${tab.label} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon color={isActive ? colorTokens.textInverse : colorTokens.textSecondary} size={16} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colorTokens.textInverse,
  },
});
