import { RequireAuth } from "@/components/RequireAuth";
import { AdminAreasScreen } from "@/features/admin/screens/AdminAreasScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

export default function AdminAreasRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth admin permission="manage_areas" active="home">
      <AdminShell
        activeTab="areas"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <AdminAreasScreen />
      </AdminShell>
    </RequireAuth>
  );
}
