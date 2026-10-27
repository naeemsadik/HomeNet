import { Redirect } from "expo-router";

/** `/dashboard` is a legacy alias — the canonical seller hub is `/seller`. */
export default function DashboardRoute() {
  return <Redirect href="/seller" />;
}
