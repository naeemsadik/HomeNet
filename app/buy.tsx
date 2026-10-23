import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function BuyRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("seo.buy.title")}
        description={t("seo.buy.description")}
      />
      {/* title="Property for Sale in Dhaka | HomeNet BD" */}
      <BrowseScreen mode="buy" />
    </>
  );
}
