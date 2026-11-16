import { RequireAuth } from "@/components/RequireAuth";
import { MessListingWizard } from "@/features/mess/screens/MessListingWizard";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** List a vacant seat. Signed-in only, like /property/create. */
export default function MessCreateRoute() {
  if (!MESS_ENABLED) return <NotFoundScreen />;
  return (
    <RequireAuth active="post">
      <MessListingWizard />
    </RequireAuth>
  );
}
