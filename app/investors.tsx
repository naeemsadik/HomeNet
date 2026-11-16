import { PageMeta } from "@/components/PageMeta";
import { InvestorsScreen } from "@/screens/InvestorsScreen";
import { useTranslation } from "@/i18n";

export default function InvestorsRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("investors.metaTitle")}
        description={t("investors.metaDescription")}
      />
      <InvestorsScreen />
    </>
  );
}
