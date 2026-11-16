import { PageMeta } from "@/components/PageMeta";
import { HelpScreen } from "@/screens/HelpScreen";
import { useTranslation } from "@/i18n";

export default function HelpRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("helpCenter.metaTitle")}
        description={t("helpCenter.metaDescription")}
      />
      <HelpScreen />
    </>
  );
}
