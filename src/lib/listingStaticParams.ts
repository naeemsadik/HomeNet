/**
 * The live listing ids, for `generateStaticParams` in app/property/[id].tsx.
 *
 * Exporting one HTML file per listing gives every listing URL its own
 * canonical tag in the HTML Google first fetches. Without it, every listing is
 * served the same "/property/[id]" shell, with one shared title and no
 * canonical, and Search Console files them under "Duplicate without
 * user-selected canonical". A listing created after the deploy still works: it
 * falls through to the shell (vercel.json rewrite) until the next build.
 *
 * Mirrors liveListings() in scripts/generate-sitemap.mjs, so the exported pages
 * match the sitemap. A failed API call must not fail the deploy: it returns no
 * ids and the build ships with the shell only, as before.
 */
const API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.homenetbd.com").replace(/\/$/, "");
const PAGE_SIZE = 100; // the API's maximum
const MAX_PAGES = 50; // a runaway-loop guard: 5,000 listings
const TIMEOUT_MS = 15_000;

type ListingsPage = { data?: { items?: { id?: string; status?: string }[]; total?: number } };

export async function listingStaticParams(): Promise<{ id: string }[]> {
  const ids: string[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await fetch(`${API_URL}/v1/properties?page=${page}&limit=${PAGE_SIZE}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`API returned HTTP ${response.status} on page ${page}`);
      const body = (await response.json()) as ListingsPage;
      const items = body?.data?.items;
      if (!Array.isArray(items)) throw new Error("API response has no data.items list");
      for (const item of items) {
        if (item?.id && (item.status === undefined || item.status === "active")) ids.push(String(item.id));
      }
      if (items.length < PAGE_SIZE || ids.length >= (body.data?.total ?? 0)) break;
    }
  } catch (error) {
    console.warn(`WARNING: listing pages not pre-rendered: ${(error as Error).message}`);
    return [];
  }
  return [...new Set(ids)].map((id) => ({ id }));
}
