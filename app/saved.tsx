import { RequireAuth } from "@/components/RequireAuth";
import { SavedScreen } from "@/screens/SavedScreen";

export default function SavedRoute() {
  return (
    <RequireAuth active="saved">
      <SavedScreen />
    </RequireAuth>
  );
}
