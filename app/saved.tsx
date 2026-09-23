import { PageMeta } from "@/components/PageMeta";
import { RequireAuth } from "@/components/RequireAuth";
import { SavedScreen } from "@/screens/SavedScreen";

export default function SavedRoute() {
  return (
    <RequireAuth active="saved">
      <PageMeta title="Saved Properties | HomeNet" />
      <SavedScreen />
    </RequireAuth>
  );
}
