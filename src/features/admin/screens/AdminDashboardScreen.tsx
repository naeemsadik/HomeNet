import { Redirect, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { ADMIN_TAB_PATH, visibleAdminTabs } from "../components/AdminTabNav";

/**
 * /admin has no content of its own: every tab is a page of its own (ADMIN_TAB_PATH). It sends
 * the visitor to the tab named in an old ?tab= link, or to the first tab they may open.
 */
export function AdminDashboardScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const userRoles = useAuthStore((s) => s.userRoles);
  const tabs = visibleAdminTabs(userRoles);
  const target = tabs.find((candidate) => candidate.key === tab) ?? tabs[0];
  return <Redirect href={ADMIN_TAB_PATH[target.key] as never} />;
}
