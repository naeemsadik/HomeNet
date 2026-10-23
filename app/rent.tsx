import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function RentRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("seo.rent.title")}
        description={t("seo.rent.description")}
      />
      {/* title="Property to Rent in Dhaka | HomeNet BD" */}
      <BrowseScreen mode="rent" />
    </>
  );
}
