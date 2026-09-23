import { PageMeta } from "@/components/PageMeta";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function SoldRoute() {
  return (
    <>
      <PageMeta
        title="Recently Sold Property Prices | HomeNet"
        description="See confirmed sale prices for properties across Dhaka and Bangladesh."
      />
      <BrowseScreen mode="sold" />
    </>
  );
}
