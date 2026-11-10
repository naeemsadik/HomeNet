import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema, ORGANIZATION_ID } from "@/lib/schema";
import type { SchemaNode } from "@/lib/schema/types";
import { SITE_URL } from "@/lib/seo";
import { BuyerGuidesScreen } from "@/screens/resources/BuyerGuidesScreen";

export default function BuyerGuidesRoute() {
  const { t } = useTranslation();

  const canonicalUrl = `${SITE_URL}/resources/buyer-guides`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Resources", url: canonicalUrl },
    { name: "Buyer Guides", url: canonicalUrl },
  ];

  const howToNode: SchemaNode = {
    "@type": "HowTo",
    "@id": `${canonicalUrl}#howto`,
    url: canonicalUrl,
    name: t("buyerGuides.headline"),
    description: t("buyerGuides.metaDescription"),
    inLanguage: "en-BD",
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <>
      <PageMeta
        canonicalPath="/resources/buyer-guides"
        description={t("buyerGuides.metaDescription")}
        title={t("buyerGuides.metaTitle")}
      />
      <JsonLd
        nodes={[
          organizationSchema(),
          breadcrumbSchema(crumbs),
          howToNode,
        ]}
      />
      <BuyerGuidesScreen />
    </>
  );
}

