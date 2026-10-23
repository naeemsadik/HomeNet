import { RequireAuth } from "@/components/RequireAuth";
import { AdminRolesScreen } from "@/features/admin/screens/AdminRolesScreen";

export default function AdminRolesRoute() {
  return (
    <RequireAuth admin permission="view_roles" active="home">
      <AdminRolesScreen />
    </RequireAuth>
  );
}
