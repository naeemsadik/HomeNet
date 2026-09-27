import { useLocalSearchParams } from "expo-router";
import { RequirePermission } from "@/components/RequirePermission";
import { UserDetailScreen } from "@/screens/UserDetailScreen";

// Opened only from the staff user lists, so it is gated the same way as /users.
export default function UserDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequirePermission permission="manage_users">
      <UserDetailScreen userId={id} />
    </RequirePermission>
  );
}
