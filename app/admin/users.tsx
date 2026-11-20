import { RequireAuth } from "@/components/RequireAuth";
import { AdminUsersScreen } from "@/features/admin/screens/AdminUsersScreen";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminUsersRoute() {
  return (
    <RequireAuth admin permission="manage_users" active="home">
      <AdminShell activeTab="users">
        <AdminUsersScreen />
      </AdminShell>
    </RequireAuth>
  );
}
