import { RequireAuth } from "@/components/RequireAuth";
import { AdminUsersScreen } from "@/features/admin/screens/AdminUsersScreen";

export default function AdminUsersRoute() {
  return (
    <RequireAuth admin permission="manage_users" active="home">
      <AdminUsersScreen />
    </RequireAuth>
  );
}
