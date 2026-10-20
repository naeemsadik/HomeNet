import { seoAreaBySlug, type SeoArea } from "@/content/areas";
import { SITE_URL } from "@/lib/seo";
import type { BreadcrumbCrumb, SchemaNode } from "./types";

export function breadcrumbSchema(crumbs: BreadcrumbCrumb[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export type ListingIntent = "buy" | "rent";

export const INTENT_LABEL: Record<ListingIntent, string> = {
  buy: "Property for Sale",
  rent: "Property to Rent",
};

/** Home › Property to Rent › Dhaka › Gulshan, for an area landing page. */
export function areaCrumbs(area: SeoArea, intent: ListingIntent): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: INTENT_LABEL[intent], url: `${SITE_URL}/${intent}` },
  ];
  const parent = seoAreaBySlug(area.parent);
  if (parent) crumbs.push({ name: parent.name, url: `${SITE_URL}/${intent}/${parent.slug}` });
  crumbs.push({ name: area.name, url: `${SITE_URL}/${intent}/${area.slug}` });
  return crumbs;
}
