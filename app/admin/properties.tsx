import { RequireAuth } from "@/components/RequireAuth";
import { AdminPropertiesScreen } from "@/features/admin/screens/AdminPropertiesScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router, useLocalSearchParams } from "expo-router";

export default function AdminPropertiesRoute() {
  const { t } = useTranslation();
  const { from } = useLocalSearchParams<{ from?: string }>();
  return (
    <RequireAuth admin permission="manage_properties" active="home">
      <AdminShell
        activeTab="properties"
        backAction={
          from === "notifications"
            ? { label: t("admin.backToNotifications"), onPress: () => router.replace("/admin/notifications" as never) }
            : undefined
        }
      >
        <AdminPropertiesScreen />
      </AdminShell>
    </RequireAuth>
  );
}
