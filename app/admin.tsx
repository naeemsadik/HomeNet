import { RequireAuth } from "@/components/RequireAuth";
import { AdminDashboardScreen } from "@/features/admin/screens/AdminDashboardScreen";

export default function AdminRoute() {
  return (
    <RequireAuth admin active="home">
      <AdminDashboardScreen />
    </RequireAuth>
  );
}
