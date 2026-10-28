import { PageMeta } from "@/components/PageMeta";
import { useTranslation } from "@/i18n";
import { PropertyExploreScreen } from "@/features/property/screens/PropertyExploreScreen";

export default function ExploreRoute() {
  const { t } = useTranslation();
  return (
    <>
      {/* Shows the same listings as /buy. Without this it carried the
          homepage's title and its own canonical, so Google saw a near-copy of
          two pages and chose a different canonical than the one we gave it. */}
      <PageMeta canonicalPath="/buy" title={t("seo.buy.title")} description={t("seo.buy.description")} />
      <PropertyExploreScreen />
    </>
  );
}
