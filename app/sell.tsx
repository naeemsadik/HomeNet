import { PageMeta } from "@/components/PageMeta";
import { SellScreen } from "@/screens/SellScreen";

export default function SellRoute() {
  return (
    <>
      <PageMeta
        title="List Your Property | HomeNet"
        description="Describe your property in one sentence and HomeNet fills in the rest. Free to list."
      />
      <SellScreen />
    </>
  );
}
