import { RequireAuth } from "@/components/RequireAuth";
import { AdminUniversitiesScreen } from "@/features/admin/screens/AdminUniversitiesScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminUniversitiesRoute() {
  return (
    <RequireAuth admin permission="manage_areas" active="home">
      <AdminShell activeTab="universities">
        <AdminUniversitiesScreen />
      </AdminShell>
    </RequireAuth>
  );
}
