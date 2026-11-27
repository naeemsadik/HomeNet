import { useLocalSearchParams } from "expo-router";
import { MessDetailScreen } from "@/features/mess/screens/MessDetailScreen";
import { MESS_ENABLED } from "@/lib/features";
import { listingKeyFromSegment } from "@/lib/listingPath";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/**
 * One mess listing. Served from the "[id]" shell (vercel.json rewrite); not
 * pre-rendered per listing until the mess API is live to list the ids.
 */
export default function MessDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // The URL reads /mess/<title words>-<uuid>; the API is asked for the uuid.
  const listingId = listingKeyFromSegment(id);
  if (!MESS_ENABLED || !listingId) return <NotFoundScreen />;
  return <MessDetailScreen key={listingId} id={listingId} />;
}
