import { PageMeta } from "@/components/PageMeta";
import { AccessibilityScreen } from "@/screens/AccessibilityScreen";
import { useTranslation } from "@/i18n";

export default function AccessibilityRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("accessibility.metaTitle")}
        description={t("accessibility.metaDescription")}
      />
      <AccessibilityScreen />
    </>
  );
}
