/**
 * Landing page metrics definition and registry.
 *
 * `source: 'api'`      → fetched live via useLandingMetrics(); `value` is the fallback
 *                        shown while loading or if the request fails.
 * `source: 'business'` → REQUIRES VERIFIED BUSINESS/PRODUCT DATA. No source exists in
 *                        the codebase. `value: null` renders the placeholder treatment.
 *                        Replace `value` with a confirmed figure to activate the tile.
 * `source: 'static'`   → Fixed platform architecture constants.
 */
export interface MetricItem {
  id: string;
  label: string;
  source: "api" | "static" | "business";
  value: number | null;
  suffix?: string;
}

export const landingMetrics: Record<string, MetricItem> = {
  activeListings: {
    id: "activeListings",
    label: "Active listings",
    source: "api",
    value: null,
  },
  forSale: {
    id: "forSale",
    label: "For sale",
    source: "api",
    value: null,
  },
  forRent: {
    id: "forRent",
    label: "To rent",
    source: "api",
    value: null,
  },
  areasCovered: {
    id: "areasCovered",
    label: "Dhaka areas",
    source: "api",
    value: null,
  },
  categories: {
    id: "categories",
    label: "Property types",
    source: "static",
    value: 4,
  },
  registeredUsers: {
    id: "registeredUsers",
    label: "Registered users",
    source: "business",
    value: null, // [REQUIRES VERIFIED BUSINESS/PRODUCT DATA]
  },
  verifiedSellers: {
    id: "verifiedSellers",
    label: "Verified sellers",
    source: "business",
    value: null, // [REQUIRES VERIFIED BUSINESS/PRODUCT DATA]
  },
  monthlyVisitors: {
    id: "monthlyVisitors",
    label: "Monthly visitors",
    source: "business",
    value: null, // [REQUIRES VERIFIED BUSINESS/PRODUCT DATA]
  },
};
