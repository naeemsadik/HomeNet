import { RequireAuth } from "@/components/RequireAuth";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { adminNotificationTarget } from "@/features/admin/utils/notificationTarget";
import { router } from "expo-router";
import type { Notification } from "@/types/api";

function openNotification(notification: Notification) {
  const target = adminNotificationTarget(notification);
  if (!target) return;
  router.push(("href" in target ? target.href : target) as never);
}

export default function AdminNotificationsRoute() {
  return (
    <RequireAuth admin permission="moderate_listing" active="home">
      <AdminShell activeTab="notifications">
        <NotificationList audience="admin" onPressItem={openNotification} />
      </AdminShell>
    </RequireAuth>
  );
}
