import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { PropertyNewsTrendsScreen } from "@/screens/resources/PropertyNewsTrendsScreen";

export default function PropertyNewsTrendsRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/property-news-trends`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Property News & Trends", url: canonicalUrl },
  ];

  const collectionNode: SchemaNode = {
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collection`,
    url: canonicalUrl,
    name: t("propertyNewsTrends.headline"),
    description: t("propertyNewsTrends.metaDescription"),
    inLanguage: "en-BD",
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <>
      <PageMeta
        canonicalPath="/resources/property-news-trends"
        description={t("propertyNewsTrends.metaDescription")}
        title={t("propertyNewsTrends.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          collectionNode,
        ]}
      />
      <PropertyNewsTrendsScreen />
    </>
  );
}

