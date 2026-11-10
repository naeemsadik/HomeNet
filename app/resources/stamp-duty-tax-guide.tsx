import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { StampDutyTaxGuideScreen } from "@/screens/resources/StampDutyTaxGuideScreen";

export default function StampDutyTaxGuideRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/stamp-duty-tax-guide`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Stamp Duty & Tax Guide", url: canonicalUrl },
  ];

  const articleNode: SchemaNode = {
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    headline: t("stampDutyGuide.headline"),
    description: t("stampDutyGuide.metaDescription"),
    inLanguage: "en-BD",
    author: {
      "@type": "Organization",
      name: "HomeNet Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <>
      <PageMeta
        canonicalPath="/resources/stamp-duty-tax-guide"
        description={t("stampDutyGuide.metaDescription")}
        title={t("stampDutyGuide.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          articleNode,
        ]}
      />
      <StampDutyTaxGuideScreen />
    </>
  );
}

