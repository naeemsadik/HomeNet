import { PageMeta } from "@/components/PageMeta";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function RentRoute() {
  return (
    <>
      <PageMeta
        title="Property to Rent in Dhaka | HomeNet"
        description="Browse verified apartments and houses to rent across Dhaka and Bangladesh."
      />
      <BrowseScreen mode="rent" />
    </>
  );
}
