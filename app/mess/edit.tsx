import { useLocalSearchParams } from "expo-router";
import { RequireAuth } from "@/components/RequireAuth";
import { MessListingWizard } from "@/features/mess/screens/MessListingWizard";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/**
 * Edit a seat listing: /mess/edit?id=<listing id>.
 *
 * The id is read behind RequireAuth, not before it. The build exports this
 * page with no query string, so a missing-id check up here would bake the
 * not-found page into mess/edit.html: every lister would see "Page not found"
 * until the app loaded, and React would then throw a hydration error. Behind
 * RequireAuth the export and the browser's first render are both the sign-in
 * check's loading state.
 */
export default function MessEditRoute() {
  if (!MESS_ENABLED) return <NotFoundScreen />;
  return (
    <RequireAuth active="post">
      <MessEditBody />
    </RequireAuth>
  );
}

function MessEditBody() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <NotFoundScreen />;
  return <MessListingWizard key={id} editId={id} />;
}
