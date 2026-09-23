import { PageMeta } from "@/components/PageMeta";
import { GuidesArchiveScreen } from "@/features/news/screens/GuidesArchiveScreen";

export default function GuidesArchiveRoute() {
  return (
    <>
      <PageMeta
        title="Guides & Real Estate News | HomeNet Bangladesh"
        description="Comprehensive guides for buying, renting, selling, and registering property in Bangladesh, alongside Dhaka real estate market news."
      />
      <GuidesArchiveScreen />
    </>
  );
}
