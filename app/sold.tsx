import { useState } from "react";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function SoldRoute() {
  const { t } = useTranslation();
  const [isZero, setIsZero] = useState(false);
  return (
    <>
      <PageMeta
        title={t("seo.sold.title")}
        description={t("seo.sold.description")}
        robots={isZero ? "noindex, follow" : undefined}
      />
      {/* title="Recently Sold Property Prices | HomeNet BD" */}
      <BrowseScreen mode="sold" onTotalChange={(total) => setIsZero(total === 0)} />
    </>
  );
}
