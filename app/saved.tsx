import { PageMeta } from "@/components/PageMeta";
import { RequireAuth } from "@/components/RequireAuth";
import { useTranslation } from "@/i18n";
import { SavedScreen } from "@/screens/SavedScreen";

export default function SavedRoute() {
  const { t } = useTranslation();
  return (
    <RequireAuth active="saved">
      <PageMeta
        title={t("seo.saved.title")}
        description={t("seo.saved.description")}
      />
      {/* title="Saved Properties | HomeNet BD" */}
      <SavedScreen />
    </RequireAuth>
  );
}
