import { Redirect } from "expo-router";
import { PageMeta } from "@/components/PageMeta";

/**
 * `/sold` is retired. Sold sales live at `/buy?status=sold` and completed
 * lets at `/rent?status=rented`, each beside the listings they belong with.
 *
 * vercel.json answers this path with a 301 before the file is ever served,
 * which is what a crawler and an old bookmark get. This component is the
 * fallback for anyone already inside the app when they follow a stale link:
 * `noindex, follow` so the hop is not indexed but the destination is still
 * crawled, and no canonical, because this page is not a copy of anything.
 */
export default function SoldRoute() {
  return (
    <>
      <PageMeta
        title="Sold properties | HomeNet BD"
        description="Sold and rented listings now live alongside the properties they belong with."
        robots="noindex, follow"
        noCanonical
      />
      <Redirect href="/buy?status=sold" />
    </>
  );
}
