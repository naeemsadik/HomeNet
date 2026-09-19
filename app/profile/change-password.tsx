import { RequireAuth } from "@/components/RequireAuth";
import { ChangePasswordScreen } from "@/screens/ChangePasswordScreen";

export default function ChangePasswordRoute() {
  return (
    <RequireAuth active="profile">
      <ChangePasswordScreen />
    </RequireAuth>
  );
}
