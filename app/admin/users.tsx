import { RequireAuth } from "@/components/RequireAuth";
import { AdminUsersScreen } from "@/features/admin/screens/AdminUsersScreen";

export default function AdminUsersRoute() {
  return (
    <RequireAuth admin active="home">
      <AdminUsersScreen />
    </RequireAuth>
  );
}
