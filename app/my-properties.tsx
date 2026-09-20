import { RequireAuth } from "@/components/RequireAuth";
import { MyPropertiesScreen } from "@/features/property/screens/MyPropertiesScreen";

export default function MyPropertiesRoute() {
  return (
    <RequireAuth active="seller">
      <MyPropertiesScreen />
    </RequireAuth>
  );
}
