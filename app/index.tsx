import { PageMeta } from "@/components/PageMeta";
import { HomeScreen } from "@/screens/HomeScreen";

export default function IndexRoute() {
  return (
    <>
      <PageMeta
        title="HomeNet — Verified Property Listings in Bangladesh"
        description="Search verified apartments, houses and land across Dhaka. Contact property owners directly."
      />
      <HomeScreen />
    </>
  );
}
