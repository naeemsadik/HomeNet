import { useLocalSearchParams } from "expo-router";
import { AreaLandingScreen, areaStaticParams } from "@/screens/AreaLandingScreen";

/** Each area in src/content/areas.ts is exported as its own static page. */
export function generateStaticParams() {
  return areaStaticParams();
}

export default function RentAreaRoute() {
  const { area } = useLocalSearchParams<{ area: string }>();
  return <AreaLandingScreen intent="rent" slug={area} />;
}
