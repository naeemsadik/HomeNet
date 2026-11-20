import { RequireAuth } from "@/components/RequireAuth";
import { AdminRolesScreen } from "@/features/admin/screens/AdminRolesScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

export default function AdminRolesRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth admin permission="view_roles" active="home">
      <AdminShell
        activeTab="roles"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <AdminRolesScreen />
      </AdminShell>
    </RequireAuth>
  );
}
