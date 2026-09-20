import { RequireAuth } from "@/components/RequireAuth";
import { SellerDashboardScreen } from "@/features/seller/screens/SellerDashboardScreen";

export default function SellerRoute() {
  return (
    <RequireAuth active="seller">
      <SellerDashboardScreen />
    </RequireAuth>
  );
}
