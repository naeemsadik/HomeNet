import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { SellerGuidesScreen } from "@/screens/resources/SellerGuidesScreen";

export default function SellerGuidesRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/seller-guides`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Seller Guides", url: canonicalUrl },
  ];

  const howToNode: SchemaNode = {
    "@type": "HowTo",
    "@id": `${canonicalUrl}#howto`,
    url: canonicalUrl,
    name: t("sellerGuides.headline"),
    description: t("sellerGuides.metaDescription"),
    inLanguage: "en-BD",
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <>
      <PageMeta
        canonicalPath="/resources/seller-guides"
        description={t("sellerGuides.metaDescription")}
        title={t("sellerGuides.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          howToNode,
        ]}
      />
      <SellerGuidesScreen />
    </>
  );
}

