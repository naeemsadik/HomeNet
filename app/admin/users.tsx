import { RequireAuth } from "@/components/RequireAuth";
import { AdminUsersScreen } from "@/features/admin/screens/AdminUsersScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

export default function AdminUsersRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth admin permission="manage_users" active="home">
      <AdminShell
        activeTab="users"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <AdminUsersScreen />
      </AdminShell>
    </RequireAuth>
  );
}
