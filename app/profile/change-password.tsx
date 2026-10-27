import { Redirect } from "expo-router";

/** Change password is now handled via the in-page modal on `/profile`. */
export default function ChangePasswordRoute() {
  return <Redirect href="/profile" />;
}
