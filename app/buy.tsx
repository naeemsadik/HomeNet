import { useState } from "react";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function BuyRoute() {
  const { t } = useTranslation();
  const [isZero, setIsZero] = useState(false);
  return (
    <>
      <PageMeta
        title={t("seo.buy.title")}
        description={t("seo.buy.description")}
        robots={isZero ? "noindex, follow" : undefined}
      />
      {/* title="Property for Sale in Dhaka | HomeNet BD" */}
      <BrowseScreen mode="buy" onTotalChange={(total) => setIsZero(total === 0)} />
    </>
  );
}
