import { RequireAuth } from "@/components/RequireAuth";
import { SellerProfileScreen } from "@/features/seller/screens/SellerProfileScreen";

export default function SellerProfileRoute() {
  return (
    <RequireAuth active="seller">
      <SellerProfileScreen />
    </RequireAuth>
  );
}
