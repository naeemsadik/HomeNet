import { MessBrowseScreen } from "@/features/mess/screens/MessBrowseScreen";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/** Mess & Seat Share search. Not found until the mess API is live (MESS_ENABLED). */
export default function MessRoute() {
  return MESS_ENABLED ? <MessBrowseScreen /> : <NotFoundScreen />;
}
