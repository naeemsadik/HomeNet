import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";
import { buildTimeGet } from "@/lib/buildTimeApi";

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
 * A failed API call must not fail the deploy: it returns no ids and the build
 * ships with the shell only, as before.
 */
const PAGE_SIZE = 100; // the API's maximum
const MAX_PAGES = 50; // a runaway-loop guard: 5,000 listings

type ListingsPage = { data?: { items?: { id?: string; status?: string }[]; total?: number } };

export async function listingStaticParams(): Promise<{ id: string }[]> {
  const ids: string[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const body = await buildTimeGet<ListingsPage>(`/v1/properties?page=${page}&limit=${PAGE_SIZE}`);
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

/**
 * One listing as the build saw it, for generateStaticParams in
 * app/property/[id].tsx. The page renders it into the exported HTML (title,
 * price, photos, text and structured data), so crawlers and link previews that
 * do not run JavaScript see the listing rather than a spinner.
 *
 * The snapshot is published inside the page, so the owner's phone numbers and
 * sign-in identities are left out: the browser fetches them when the page
 * loads, as before. Null when the API fails: the page then exports as the
 * loading state, which is noindex, and the sitemap leaves it out.
 */
export async function listingSnapshot(id: string): Promise<PropertyDetail | null> {
  try {
    const body = await buildTimeGet<{ data?: PropertyDetail & { phone?: unknown } }>(
      `/v1/properties/${encodeURIComponent(id)}`,
    );
    const detail = body?.data;
    if (!detail?.id) throw new Error("API response has no listing");
    const { phone, ...publicDetail } = detail;
    return { ...publicDetail, user: detail.user ? { ...detail.user, auth_identities: [] } : null };
  } catch (error) {
    console.warn(`WARNING: listing ${id} exported without its content: ${(error as Error).message}`);
    return null;
  }
}
