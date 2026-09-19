import { RequireAuth } from "@/components/RequireAuth";
import { BuyerProfileScreen } from "@/features/user/screens/BuyerProfileScreen";

export default function ProfileRoute() {
  return (
    <RequireAuth active="profile">
      <BuyerProfileScreen />
    </RequireAuth>
  );
}
