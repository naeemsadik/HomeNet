import { RequireAuth } from "@/components/RequireAuth";
import { PropertyEditScreen } from "@/features/property/screens/PropertyEditScreen";

export default function PropertyEditRoute() {
  return (
    <RequireAuth active="sell">
      <PropertyEditScreen />
    </RequireAuth>
  );
}
