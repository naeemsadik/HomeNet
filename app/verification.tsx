import { RequireAuth } from "@/components/RequireAuth";
import { VerificationScreen } from "@/features/seller/screens/VerificationScreen";

export default function VerificationRoute() {
  return (
    <RequireAuth active="seller">
      <VerificationScreen />
    </RequireAuth>
  );
}
