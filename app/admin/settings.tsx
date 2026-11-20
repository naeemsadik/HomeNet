import { RequireAuth } from "@/components/RequireAuth";
import { AdminSettingsTab } from "@/features/admin/screens/AdminDashboardScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

export default function AdminSettingsRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth admin active="home">
      <AdminShell
        activeTab="settings"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <AdminSettingsTab />
      </AdminShell>
    </RequireAuth>
  );
}
