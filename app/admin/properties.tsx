import { RequireAuth } from "@/components/RequireAuth";
import { AdminPropertiesScreen } from "@/features/admin/screens/AdminPropertiesScreen";

export default function AdminPropertiesRoute() {
  return (
    <RequireAuth admin permission="manage_properties" active="home">
      <AdminPropertiesScreen />
    </RequireAuth>
  );
}
