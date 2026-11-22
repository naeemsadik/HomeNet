import { RequireAuth } from "@/components/RequireAuth";
import { AdminRolesScreen } from "@/features/admin/screens/AdminRolesScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminRolesRoute() {
  return (
    <RequireAuth admin permission="view_roles" active="home">
      <AdminShell activeTab="roles">
        <AdminRolesScreen />
      </AdminShell>
    </RequireAuth>
  );
}
