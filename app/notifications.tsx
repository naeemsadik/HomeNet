import { Redirect } from "expo-router";

/** `/notifications` is a legacy alias — canonical notifications/enquiries hub is `/enquiries`. */
export default function NotificationsRoute() {
  return <Redirect href={"/enquiries" as any} />;
}
