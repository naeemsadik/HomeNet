import { useLocalSearchParams } from "expo-router";
import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { PropertyDetailScreen } from "@/features/property/screens/PropertyDetailScreen";
import { BuildSnapshot } from "@/lib/buildSnapshot";
import { listingSnapshot, listingStaticParams } from "@/lib/listingStaticParams";

/** Each live listing is exported as its own static page; see listingStaticParams. */
export async function generateStaticParams() {
  return listingStaticParams();
}

type ListingLoaderData = { detail: PropertyDetail | null };

/**
 * Runs at export time only: the listing goes into the page's HTML, so the
 * exported file shows the listing rather than a spinner. The "[id]" shell that
 * serves listings created after the build has no listing to fetch.
 */
export async function loader(_request: unknown, params: Record<string, string | string[]>): Promise<ListingLoaderData> {
  const id = String(Array.isArray(params.id) ? params.id[0] : params.id ?? "");
  return { detail: id && !id.includes("[") ? await listingSnapshot(id) : null };
}

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <BuildSnapshot<ListingLoaderData>
      key={id}
      render={(snapshot) => <PropertyDetailScreen initialDetail={snapshot?.detail ?? undefined} />}
    />
  );
}
