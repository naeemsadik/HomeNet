import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { hasPermission } from "@/lib/permissions";
import { NotFoundScreen } from "@/screens/NotFoundScreen";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens } from "@/theme";
import { AppChrome } from "./AppChrome";

/**
 * Route gate for staff-only pages the public shouldn't know exist.
 *
 * Anyone without `permission`, signed-out visitors included, gets the same
 * not-found page as a mistyped URL, and `children` never mount, so the page's
 * own API calls never fire. Use RequireAuth instead when a page should invite
 * the visitor to sign in.
 *
 * Pass the permission the API checks for the page's data, so the page never
 * renders for someone whose requests would be refused.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const allowed = useAuthStore(
    (s) => s.user !== null && hasPermission(s.userRoles, permission),
  );

  // The session restore loads roles before setting `hydrated`. Deciding
  // earlier would flash the 404 at a signed-in admin on every refresh.
  if (!hydrated) {
    return (
      <AppChrome active="home">
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.brand} size="large" />
        </View>
      </AppChrome>
    );
  }

  if (!allowed) return <NotFoundScreen />;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
  },
});
