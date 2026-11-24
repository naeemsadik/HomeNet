import { PageMeta } from "@/components/PageMeta";
import { SellScreen } from "@/screens/SellScreen";

export default function SellRoute() {
  return (
    <>
      <PageMeta
        title="List Your Property | HomeNet BD"
        description="List your flat, house, plot or commercial space on HomeNet BD for free. Publish in minutes, add photos and a map pin, and buyers contact you directly."
      />
      <SellScreen />
    </>
  );
}
