import { useLocalSearchParams } from "expo-router";
import { RequireAuth } from "@/components/RequireAuth";
import { MessListingWizard } from "@/features/mess/screens/MessListingWizard";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** Edit a seat listing: /mess/edit?id=<listing id>. */
export default function MessEditRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!MESS_ENABLED || !id) return <NotFoundScreen />;
  return (
    <RequireAuth active="post">
      <MessListingWizard key={id} editId={id} />
    </RequireAuth>
  );
}
