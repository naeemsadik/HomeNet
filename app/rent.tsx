import { useState } from "react";
import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function RentRoute() {
  const { t } = useTranslation();
  const [isZero, setIsZero] = useState(false);
  return (
    <>
      <PageMeta
        title={t("seo.rent.title")}
        description={t("seo.rent.description")}
        robots={isZero ? "noindex, follow" : undefined}
      />
      {/* title="Property to Rent in Dhaka | HomeNet BD" */}
      <BrowseScreen mode="rent" onTotalChange={(total) => setIsZero(total === 0)} />
    </>
  );
}
