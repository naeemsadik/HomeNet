import { PageMeta } from "@/components/PageMeta";
import { SitemapScreen } from "@/screens/SitemapScreen";
import { useTranslation } from "@/i18n";

export default function SitemapRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("sitemap.metaTitle")}
        description={t("sitemap.metaDescription")}
      />
      <SitemapScreen />
    </>
  );
}
