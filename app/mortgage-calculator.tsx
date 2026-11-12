import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { MortgageCalculatorScreen } from "@/features/mortgage/screens/MortgageCalculatorScreen";

export default function MortgageCalculatorRoute() {
  const { t } = useTranslation();

  const crumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Mortgage Calculator", url: `${SITE_URL}/mortgage-calculator` },
  ];

  return (
    <>
      <PageMeta
        canonicalPath="/mortgage-calculator"
        description={t("mortgage.metaDescription")}
        title={t("mortgage.metaTitle")}
      />
      <JsonLd nodes={[organizationSchema(), breadcrumbSchema(crumbs)]} />
      <MortgageCalculatorScreen />
    </>
  );
}
