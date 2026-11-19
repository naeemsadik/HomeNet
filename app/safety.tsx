import { PageMeta } from "@/components/PageMeta";
import { SafetyScreen } from "@/screens/SafetyScreen";
import { useTranslation } from "@/i18n";

export default function SafetyRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("safety.metaTitle")}
        description={t("safety.metaDescription")}
      />
      <SafetyScreen />
    </>
  );
}
