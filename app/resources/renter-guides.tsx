import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { RenterGuidesScreen } from "@/screens/resources/RenterGuidesScreen";

export default function RenterGuidesRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/renter-guides`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Renter Guides", url: canonicalUrl },
  ];

  const howToNode: SchemaNode = {
    "@type": "HowTo",
    "@id": `${canonicalUrl}#howto`,
    url: canonicalUrl,
    name: t("renterGuides.headline"),
    description: t("renterGuides.metaDescription"),
    inLanguage: "en-BD",
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <>
      <PageMeta
        canonicalPath="/resources/renter-guides"
        description={t("renterGuides.metaDescription")}
        title={t("renterGuides.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          howToNode,
        ]}
      />
      <RenterGuidesScreen />
    </>
  );
}

