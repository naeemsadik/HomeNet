import { RequireAuth } from "@/components/RequireAuth";
import { NotificationScreen } from "@/screens/NotificationScreen";

export default function NotificationsRoute() {
  return (
    <RequireAuth active="enquiries">
      <NotificationScreen activePage="enquiries" />
    </RequireAuth>
  );
}
