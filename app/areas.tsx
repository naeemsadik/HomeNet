import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { AreasScreen } from "@/screens/AreasScreen";

export default function AreasRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title={t("seo.areas.title")} description={t("seo.areas.description")} />
      <AreasScreen />
    </>
  );
}
