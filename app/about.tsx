import { PageMeta } from "@/components/PageMeta";
import { AboutScreen } from "@/screens/AboutScreen";

export default function AboutRoute() {
  return (
    <>
      <PageMeta
        title="About HomeNet BD | Property Marketplace in Bangladesh"
        description="HomeNet BD is a property marketplace for Bangladesh where owners list flats, houses and land for free, and buyers and tenants contact them directly."
      />
      <AboutScreen />
    </>
  );
}
