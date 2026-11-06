import { useLocalSearchParams } from "expo-router";
import type { BrowseSnapshot } from "@/lib/browseSnapshot";
import { BuildSnapshot } from "@/lib/buildSnapshot";
import { AreaLandingScreen, areaStaticParams } from "@/screens/AreaLandingScreen";

/** Each area in src/content/areas.ts is exported as its own static page, with its listings in the HTML. */
export function generateStaticParams() {
  return areaStaticParams("buy");
}

export default function BuyAreaRoute() {
  const { area } = useLocalSearchParams<{ area: string }>();
  return (
    <BuildSnapshot<BrowseSnapshot>
      key={area}
      render={(snapshot) => <AreaLandingScreen intent="buy" slug={area} initialResults={snapshot} />}
    />
  );
}
