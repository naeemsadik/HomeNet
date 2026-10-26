import React from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { NotificationScreen } from "@/screens/NotificationScreen";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";

export default function EnquiriesRoute() {
  const { t } = useTranslation();

  return (
    <RequireAuth active="enquiries">
      <PageMeta
        title={`${t("nav.enquiries")} | HomeNet BD`}
        description="View your property enquiries, visit requests, and agent messages."
      />
      <NotificationScreen activePage="enquiries" />
    </RequireAuth>
  );
}
