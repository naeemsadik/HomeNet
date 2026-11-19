import { useLocalSearchParams } from "expo-router";
import { MessDetailScreen } from "@/features/mess/screens/MessDetailScreen";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/**
 * One mess listing. Served from the "[id]" shell (vercel.json rewrite); not
 * pre-rendered per listing until the mess API is live to list the ids.
 */
export default function MessDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!MESS_ENABLED) return <NotFoundScreen />;
  return <MessDetailScreen key={id} id={id} />;
}
