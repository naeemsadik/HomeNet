import { RequireAuth } from "@/components/RequireAuth";
import { AdminSettingsScreen } from "@/features/admin/screens/AdminSettingsScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminSettingsRoute() {
  return (
    <RequireAuth admin active="home">
      <AdminShell activeTab="settings">
        <AdminSettingsScreen />
      </AdminShell>
    </RequireAuth>
  );
}
