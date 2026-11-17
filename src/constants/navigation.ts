import { MESS_ENABLED } from "@/lib/features";
import type { TranslationKey } from "@/i18n";

export interface NavigationLinkItem {
  labelKey: TranslationKey;
  label: string;
  href: string;
}

export type ResourceLinkItem = NavigationLinkItem;

export const RESOURCE_LINKS: readonly NavigationLinkItem[] = [
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
 * Filter-backed search links for the footer Search column.
 * Every link routes to a distinct, filter-backed page with zero duplicates.
 * Dynamically resolves student/mess housing according to MESS_ENABLED.
 */
export const getSearchLinks = (): readonly NavigationLinkItem[] => {
  let isMessOn = MESS_ENABLED;
  try {
    isMessOn = require("@/lib/features").MESS_ENABLED;
  } catch {
    // fallback to static import
  }
  return [
    {
      labelKey: "footer.searchHomesForSale",
      label: "Search homes for sale",
      href: "/buy",
    },
    {
      labelKey: "footer.searchHomesForRent",
      label: "Search homes for rent",
      href: "/rent",
    },
    {
      labelKey: "footer.recentlySold",
      label: "Recently sold",
      href: "/sold",
    },
    {
      labelKey: "footer.commercialForSale",
      label: "Commercial properties",
      href: "/buy?type=commercial",
    },
    {
      labelKey: "footer.newDevelopments",
      label: "New developments",
      href: "/buy?condition=new",
    },
    ...(isMessOn
      ? [
          {
            labelKey: "mess.nav" as const,
            label: "Shared living",
            href: "/mess",
          },
        ]
      : []),
    {
      labelKey: "footer.verifiedListings",
      label: "Verified listings only",
      href: "/buy?is_verified=true",
    },
  ];
};

export const SEARCH_LINKS: readonly NavigationLinkItem[] = getSearchLinks();

/**
 * High-intent geographic landing pages for Dhaka, Chattogram, and Sylhet.
 */
export const LOCATION_LINKS: readonly NavigationLinkItem[] = [
  { labelKey: "footer.allAreas", label: "All areas", href: "/areas" },
  { labelKey: "footer.gulshan", label: "Gulshan", href: "/buy/gulshan" },
  { labelKey: "footer.banani", label: "Banani", href: "/buy/banani" },
  { labelKey: "footer.dhanmondi", label: "Dhanmondi", href: "/buy/dhanmondi" },
  { labelKey: "footer.uttara", label: "Uttara", href: "/buy/uttara" },
  { labelKey: "footer.bashundharaRa", label: "Bashundhara R/A", href: "/buy/bashundhara-ra" },
  { labelKey: "footer.mirpur", label: "Mirpur", href: "/buy/mirpur" },
  { labelKey: "footer.chattogram", label: "Chittagong", href: "/buy/chattogram" },
  { labelKey: "footer.sylhet", label: "Sylhet", href: "/buy/sylhet" },
] as const;

/**
 * Corporate, support, and careers links.
 * All destinations route to dedicated, production-grade screens.
 */
export const HOMENET_LINKS: readonly NavigationLinkItem[] = [
  { labelKey: "footer.aboutHomenet", label: "About HomeNet", href: "/about" },
  { labelKey: "footer.techBlog", label: "Tech blog & AI models", href: "/tech-blog" },
  { labelKey: "footer.pressCentre", label: "Press centre", href: "/press" },
  { labelKey: "footer.investorRelations", label: "Investor relations", href: "/investors" },
  { labelKey: "footer.careers", label: "Careers", href: "/careers" },
  { labelKey: "footer.contactUs", label: "Contact us", href: "/contact" },
] as const;

/**
 * Professional seller, landlord, and advertising hubs.
 * Restored to 7 distinct professional service routes.
 */
export const PROFESSIONAL_LINKS: readonly NavigationLinkItem[] = [
  { labelKey: "footer.proBoosting", label: "Property Boosting", href: "/professionals/boosting" },
  { labelKey: "footer.proPriorityAlerts", label: "Priority Notice & Alerts", href: "/professionals/priority-alerts" },
  { labelKey: "footer.proAnalytics", label: "Listing Analytics", href: "/professionals/analytics" },
  { labelKey: "footer.proVerifiedAgency", label: "Verified Agency Badge", href: "/professionals/verified-agency" },
  { labelKey: "footer.proWhatsappInquiries", label: "Direct WhatsApp Inquiries", href: "/professionals/whatsapp-inquiries" },
  { labelKey: "footer.proAccountSupport", label: "Dedicated Account Support", href: "/professionals/account-support" },
  { labelKey: "footer.proAdvertise", label: "Advertise on Homenet", href: "/professionals/advertise" },
] as const;

/**
 * Legal, compliance, trust, and utility links.
 * Every link routes to a dedicated screen with zero redirects to /about.
 */
export const LEGAL_LINKS: readonly NavigationLinkItem[] = [
  { labelKey: "footer.siteMap", label: "Site map", href: "/sitemap" },
  { labelKey: "footer.helpCenter", label: "Help", href: "/help" },
  { labelKey: "footer.safetySecurity", label: "Safety and Security", href: "/safety" },
  { labelKey: "footer.termsOfUse", label: "Terms of Use", href: "/terms" },
  { labelKey: "footer.accessibilityStatement", label: "Accessibility", href: "/accessibility" },
  { labelKey: "footer.privacyPolicy", label: "Privacy Policy", href: "/privacy" },
] as const;

/**
 * Mobile-specific legal strip (including account deletion for app stores).
 */
export const MOBILE_LEGAL_LINKS: readonly NavigationLinkItem[] = [
  { labelKey: "footer.privacyPolicy", label: "Privacy Policy", href: "/privacy" },
  { labelKey: "footer.termsOfUse", label: "Terms of Use", href: "/terms" },
  { labelKey: "footer.deleteAccount", label: "Delete account", href: "/delete-account" },
  { labelKey: "footer.contactUs", label: "Contact us", href: "/contact" },
] as const;

export const STUDENT_ACCOMMODATION_HREF: string | null = MESS_ENABLED ? "/mess" : null;
