import { PageMeta } from "@/components/PageMeta";
import { MarketScreen } from "@/screens/MarketScreen";

/** A placeholder until HomeNet publishes market data, so it stays out of the index. */
export default function MarketRoute() {
  return (
    <>
      <PageMeta title="Market Data | HomeNet BD" noindex />
      <MarketScreen />
    </>
  );
}
