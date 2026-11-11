import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { PropertyValuationGuideScreen } from "@/screens/resources/PropertyValuationGuideScreen";

export default function PropertyValuationGuideRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/property-valuation-guide`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Property Valuation Guide", url: canonicalUrl },
  ];

  const articleNode: SchemaNode = {
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    headline: t("propertyValuationGuide.headline"),
    description: t("propertyValuationGuide.metaDescription"),
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
        canonicalPath="/resources/property-valuation-guide"
        description={t("propertyValuationGuide.metaDescription")}
        title={t("propertyValuationGuide.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          articleNode,
        ]}
      />
      <PropertyValuationGuideScreen />
    </>
  );
}
