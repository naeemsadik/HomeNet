import { RequireAuth } from "@/components/RequireAuth";
import { EditProfileScreen } from "@/features/user/screens/EditProfileScreen";

export default function EditProfileRoute() {
  return (
    <RequireAuth active="profile">
      <EditProfileScreen />
    </RequireAuth>
  );
}
