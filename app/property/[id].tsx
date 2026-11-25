import { useLocalSearchParams } from "expo-router";
import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { PropertyDetailScreen } from "@/features/property/screens/PropertyDetailScreen";
import { BuildSnapshot } from "@/lib/buildSnapshot";
import { oncePerBuild, setBuildSnapshot } from "@/lib/buildTimeApi";
import { listingKeyFromSegment } from "@/lib/listingPath";
import { listingSnapshot, listingStaticParams } from "@/lib/listingStaticParams";

/**
 * Each live listing is exported as its own static page, with the listing in
 * its HTML rather than a spinner; see listingStaticParams. The "[id]" shell
 * that serves listings created after the build has no snapshot.
 *
 * The page is exported at the listing's readable URL (/property/<title words>-<uuid>,
 * see listingPath), so `id` here is that URL segment, not the bare uuid.
 */
export function generateStaticParams() {
  return oncePerBuild("listings", async () => {
    const params = await listingStaticParams();
    await Promise.all(
      params.map(async ({ id, listingId }) => setBuildSnapshot(`/property/${id}`, await listingSnapshot(listingId))),
    );
    return params.map(({ id }) => ({ id }));
  });
}

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <BuildSnapshot<PropertyDetail>
      key={listingKeyFromSegment(id)}
      render={(snapshot) => <PropertyDetailScreen initialDetail={snapshot} />}
    />
  );
}
