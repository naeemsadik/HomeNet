import { RequireAuth } from "@/components/RequireAuth";
import { AdminAreasScreen } from "@/features/admin/screens/AdminAreasScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminAreasRoute() {
  return (
    <RequireAuth admin permission="manage_areas" active="home">
      <AdminShell activeTab="areas">
        <AdminAreasScreen />
      </AdminShell>
    </RequireAuth>
  );
}
