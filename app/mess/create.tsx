import { RequireAuth } from "@/components/RequireAuth";
import { MessListingWizard } from "@/features/mess/screens/MessListingWizard";

/** List a vacant seat. Signed-in only, like /property/create. */
export default function MessCreateRoute() {
  return (
    <RequireAuth active="post">
      <MessListingWizard />
    </RequireAuth>
  );
}
