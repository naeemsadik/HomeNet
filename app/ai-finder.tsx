import { PageMeta } from "@/components/PageMeta";
import { AiFinderScreen } from "@/screens/AiFinderScreen";

/**
 * An interactive search over the same listings as /buy, so search engines are
 * pointed at /buy rather than index a page whose content only exists after a
 * visitor types.
 */
export default function AiFinderRoute() {
  return (
    <>
      <PageMeta
        title="AI Property Finder | HomeNet BD"
        description="Describe the home you want in your own words and HomeNet BD finds matching flats, houses and plots."
        canonicalPath="/buy"
      />
      <AiFinderScreen />
    </>
  );
}
