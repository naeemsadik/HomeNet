import { Redirect } from "expo-router";

/** Landing and homepage are one surface; `/` is canonical. */
export default function HomeRoute() {
  return <Redirect href="/" />;
}
