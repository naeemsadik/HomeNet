import { MESS_ENABLED } from "@/lib/features";
import type { TranslationKey } from "@/i18n";

export interface ResourceLinkItem {
  labelKey: TranslationKey;
  label: string;
  href: string;
}

export const RESOURCE_LINKS: readonly ResourceLinkItem[] = [
  {
    labelKey: "footer.stampDutyTaxGuide",
    label: "Stamp Duty & Tax Guide",
    href: "/resources/stamp-duty-tax-guide",
  },
  {
    labelKey: "footer.propertyPriceIndex",
    label: "Property Price Index",
    href: "/resources/property-price-index",
  },
  {
    labelKey: "footer.propertyValuationGuide",
    label: "Property Valuation Guide",
    href: "/resources/property-valuation-guide",
  },
  {
    labelKey: "footer.propertyNewsTrends",
    label: "Property News & Trends",
    href: "/resources/property-news-trends",
  },
  {
    labelKey: "footer.buyerGuides",
    label: "Buyer Guides",
    href: "/resources/buyer-guides",
  },
  {
    labelKey: "footer.sellerGuides",
    label: "Seller Guides",
    href: "/resources/seller-guides",
  },
  {
    labelKey: "footer.renterGuides",
    label: "Renter Guides",
    href: "/resources/renter-guides",
  },
] as const;

/**
 * Where "Student accommodation" goes: Mess & Seat Share's own search at /mess, once the
 * mess API is deployed and the feature is switched on. Until then there is no page for
 * it, and no link: Browse has no student filter (it reads `subtype` only for holiday
 * stays), so a link to /rent?subtype=student would show every rental under a label
 * that promises students' housing.
 */
export const STUDENT_ACCOMMODATION_HREF: string | null = MESS_ENABLED ? "/mess" : null;
