import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function SoldRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("seo.sold.title")}
        description={t("seo.sold.description")}
      />
      {/* title="Recently Sold Property Prices | HomeNet BD" */}
      <BrowseScreen mode="sold" />
    </>
  );
}
