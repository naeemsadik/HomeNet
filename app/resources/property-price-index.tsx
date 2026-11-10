import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { PropertyPriceIndexScreen } from "@/screens/resources/PropertyPriceIndexScreen";

export default function PropertyPriceIndexRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/property-price-index`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Property Price Index", url: canonicalUrl },
  ];

  const datasetNode: SchemaNode = {
    "@type": "Dataset",
    "@id": `${canonicalUrl}#dataset`,
    url: canonicalUrl,
    name: t("propertyPriceIndex.headline"),
    description: t("propertyPriceIndex.metaDescription"),
    inLanguage: "en-BD",
    creator: {
      "@type": "Organization",
      name: "HomeNet BD",
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
        canonicalPath="/resources/property-price-index"
        description={t("propertyPriceIndex.metaDescription")}
        title={t("propertyPriceIndex.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          datasetNode,
        ]}
      />
      <PropertyPriceIndexScreen />
    </>
  );
}

