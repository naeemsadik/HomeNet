import { RequireAuth } from "@/components/RequireAuth";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";
import type { Notification } from "@/types/api";

export default function AdminNotificationsRoute() {
  const { t } = useTranslation();

  function handleNotificationPress(notification: Notification) {
    const meta = notification.metadata as Record<string, unknown> | null;
    let propertyId = (meta?.property_id || meta?.id || "") as string;
    if (!propertyId && notification.link) {
      const match =
        notification.link.match(/properties\/([a-zA-Z0-9-]+)/) ||
        notification.link.match(/property\/([a-zA-Z0-9-]+)/);
      if (match) propertyId = match[1];
    }

    if (
      notification.link?.includes("/admin/properties") ||
      notification.link?.includes("/property/") ||
      notification.type?.includes("property") ||
      propertyId
    ) {
      router.push({
        pathname: "/admin/properties",
        params: {
          from: "notifications",
          status: "pending",
          ...(propertyId ? { highlight: propertyId } : {}),
        },
      });
      return;
    }

    if (notification.link) {
      router.push(notification.link as never);
    }
  }

  return (
    <RequireAuth admin permission="moderate_listing" active="home">
      <AdminShell
        activeTab="notifications"
        backAction={{
          label: t("admin.backToDashboard"),
          onPress: () => router.push("/admin"),
        }}
      >
        <NotificationList audience="admin" onPressItem={handleNotificationPress} />
      </AdminShell>
    </RequireAuth>
  );
}
