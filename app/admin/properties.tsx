import { RequireAuth } from "@/components/RequireAuth";
import { AdminPropertiesScreen } from "@/features/admin/screens/AdminPropertiesScreen";

export default function AdminPropertiesRoute() {
  return (
    <RequireAuth admin active="home">
      <AdminPropertiesScreen />
    </RequireAuth>
  );
}
