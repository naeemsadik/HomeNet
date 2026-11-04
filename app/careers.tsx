import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { CareersScreen } from "@/screens/CareersScreen";

export default function CareersRoute() {
  const { t } = useTranslation();

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Careers", url: `${SITE_URL}/careers` },
  ];

  return (
    <>
      <PageMeta
        title={t("careers.metaTitle")}
        description={t("careers.metaDescription")}
      />
      <JsonLd nodes={[organizationSchema(), breadcrumbSchema(crumbs)]} />
      <CareersScreen />
    </>
  );
}
