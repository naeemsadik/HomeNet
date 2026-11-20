import { RequireAuth } from "@/components/RequireAuth";
import { AdminUniversitiesScreen } from "@/features/admin/screens/AdminUniversitiesScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

export default function AdminUniversitiesRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth admin permission="manage_areas" active="home">
      <AdminShell
        activeTab="universities"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <AdminUniversitiesScreen />
      </AdminShell>
    </RequireAuth>
  );
}
