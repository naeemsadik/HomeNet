import { RequireAuth } from "@/components/RequireAuth";
import { PropertyCreateWizard } from "@/features/property/screens/PropertyCreateWizard";

export default function PropertyCreateRoute() {
  return (
    <RequireAuth active="sell">
      <PropertyCreateWizard />
    </RequireAuth>
  );
}
