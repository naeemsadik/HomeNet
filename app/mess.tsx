import { PageMeta } from "@/components/PageMeta";
import { MessBrowseScreen } from "@/features/mess/screens/MessBrowseScreen";
import { useTranslation } from "@/i18n";
import { MESS_ENABLED } from "@/lib/features";
import { NotFoundScreen } from "@/screens/NotFoundScreen";

/**
 * Mess & Student Accommodation search route (/mess).
 * Not found until the mess API is live (MESS_ENABLED), so visitors never see
 * an empty or made-up listing feed.
 */
export default function MessRoute() {
  const { t } = useTranslation();
  if (!MESS_ENABLED) return <NotFoundScreen />;
  return (
    <>
      <PageMeta
        title={t("mess.meta.browseTitle")}
        description={t("mess.meta.browseDescription")}
      />
      <MessBrowseScreen />
    </>
  );
}
