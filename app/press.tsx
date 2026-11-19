import { PageMeta } from "@/components/PageMeta";
import { PressScreen } from "@/screens/PressScreen";
import { useTranslation } from "@/i18n";

export default function PressRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("press.metaTitle")}
        description={t("press.metaDescription")}
      />
      <PressScreen />
    </>
  );
}
