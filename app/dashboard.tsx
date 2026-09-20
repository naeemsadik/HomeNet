import { RequireAuth } from "@/components/RequireAuth";
import { SellerDashboardScreen } from "@/features/seller/screens/SellerDashboardScreen";

export default function DashboardRoute() {
  return (
    <RequireAuth active="seller">
      <SellerDashboardScreen />
    </RequireAuth>
  );
}
