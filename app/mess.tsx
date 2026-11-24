import { PageMeta } from "@/components/PageMeta";
import { MessBrowseScreen } from "@/features/mess/screens/MessBrowseScreen";
import { useTranslation } from "@/i18n";

/**
 * Mess & Student Accommodation search route (/mess).
 * Renders the shared living browse screen with campus selection, all-in cost filters, and map.
 */
export default function MessRoute() {
  const { t } = useTranslation();
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
