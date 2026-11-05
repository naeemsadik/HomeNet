import { useLocalSearchParams } from "expo-router";
import { BuildSnapshot } from "@/lib/buildSnapshot";
import { AreaLandingScreen, areaLoaderData, areaStaticParams, type AreaLoaderData } from "@/screens/AreaLandingScreen";

/** Each area in src/content/areas.ts is exported as its own static page. */
export function generateStaticParams() {
  return areaStaticParams();
}

/** Runs at export time only: the area's listings go into the page's HTML. */
export async function loader(_request: unknown, params: Record<string, string | string[]>): Promise<AreaLoaderData> {
  return areaLoaderData("buy", params.area);
}

export default function BuyAreaRoute() {
  const { area } = useLocalSearchParams<{ area: string }>();
  return (
    <BuildSnapshot<AreaLoaderData>
      render={(snapshot) => <AreaLandingScreen intent="buy" slug={area} initialResults={snapshot?.results ?? undefined} />}
    />
  );
}
