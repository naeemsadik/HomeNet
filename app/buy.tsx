import { PageMeta } from "@/components/PageMeta";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function BuyRoute() {
  return (
    <>
      <PageMeta
        title="Property for Sale in Dhaka | HomeNet"
        description="Browse verified apartments, houses and land for sale across Dhaka and Bangladesh."
      />
      <BrowseScreen mode="buy" />
    </>
  );
}
