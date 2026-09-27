import { RequirePermission } from "@/components/RequirePermission";
import { UsersScreen } from "@/screens/UsersScreen";

// The API lists users only for manage_users; everyone else gets a 404.
export default function UsersRoute() {
  return (
    <RequirePermission permission="manage_users">
      <UsersScreen />
    </RequirePermission>
  );
}
