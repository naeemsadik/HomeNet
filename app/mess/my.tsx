import { RequireAuth } from "@/components/RequireAuth";
import { MyMessListingsScreen } from "@/features/mess/screens/MyMessListingsScreen";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** The lister's seat listings: confirm availability, mark seats filled. */
export default function MyMessListingsRoute() {
  if (!MESS_ENABLED) return <NotFoundScreen />;
  return (
    <RequireAuth active="seller">
      <MyMessListingsScreen />
    </RequireAuth>
  );
}
