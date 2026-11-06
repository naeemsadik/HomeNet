import { useLocalSearchParams } from "expo-router";
import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { PropertyDetailScreen } from "@/features/property/screens/PropertyDetailScreen";
import { BuildSnapshot } from "@/lib/buildSnapshot";
import { oncePerBuild, setBuildSnapshot } from "@/lib/buildTimeApi";
import { listingSnapshot, listingStaticParams } from "@/lib/listingStaticParams";

/**
 * Each live listing is exported as its own static page, with the listing in
 * its HTML rather than a spinner; see listingStaticParams. The "[id]" shell
 * that serves listings created after the build has no snapshot.
 */
export function generateStaticParams() {
  return oncePerBuild("listings", async () => {
    const params = await listingStaticParams();
    await Promise.all(params.map(async ({ id }) => setBuildSnapshot(`/property/${id}`, await listingSnapshot(id))));
    return params;
  });
}

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <BuildSnapshot<PropertyDetail>
      key={id}
      render={(snapshot) => <PropertyDetailScreen initialDetail={snapshot} />}
    />
  );
}
