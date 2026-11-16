import { Platform } from "react-native";

/**
 * Features that go live when the API behind them does.
 *
 * AI search needs POST /v1/ai/parse-search (docs/BACKEND_REQUIREMENTS.md §1b).
 * Until it is deployed the finder shows only its guided questions, so no one
 * is offered a text box that cannot work. To switch it on, set
 * EXPO_PUBLIC_AI_SEARCH_ENABLED=true in the web project's environment and
 * redeploy: the web build is static, so the value is fixed at build time.
 *
 * (Quick listing needs no flag: it is an explicit "List with AI" action that
 * already falls back to the step-by-step form when the endpoint is missing.)
 */
export const AI_SEARCH_ENABLED = process.env.EXPO_PUBLIC_AI_SEARCH_ENABLED === "true";

/**
 * Google sign-in (POST /v1/auth/google). A Google OAuth *client id* is public
 * and is read from EXPO_PUBLIC_GOOGLE_CLIENT_ID at build time. The client secret
 * is never used by this flow and must not be set anywhere in this project.
 *
 * The button is shown only on the website and only when the id is present and
 * well-formed, so a deploy without it simply has no Google button. Android has
 * none yet: it needs its own client id and a native sign-in.
 *
 * There is no Facebook sign-in: the API has no route for it.
 */
const GOOGLE_CLIENT_ID_PATTERN = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;

export const GOOGLE_CLIENT_ID = (() => {
  const id = (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
  return GOOGLE_CLIENT_ID_PATTERN.test(id) ? id : null;
})();

export const GOOGLE_SIGN_IN_AVAILABLE = Platform.OS === "web" && GOOGLE_CLIENT_ID !== null;

/**
 * Google Maps (map, place search and address lookup in the listing wizard),
 * read from EXPO_PUBLIC_GOOGLE_MAPS_API_KEY at build time. The key is public by
 * design and is protected by its HTTP-referrer and API restrictions in Google
 * Cloud, not by secrecy. Without a well-formed key, or when Google refuses it,
 * the wizard uses the OpenStreetMap map and Nominatim instead. Website only.
 */
const GOOGLE_MAPS_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{35}$/;

export const GOOGLE_MAPS_API_KEY: string | null = (() => {
  const key = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
  return Platform.OS === "web" && GOOGLE_MAPS_KEY_PATTERN.test(key) ? key : null;
})();

/**
 * Seller workspace sections that are built but not ready: AI Insights, Analytics and Payments
 * show sample content with no real data or payments behind them yet. Until each is ready it is
 * left out of the seller menu (desktop sidebar and phone drawer), and /seller?tab=<name> opens
 * the dashboard instead. Their screens stay in the code (SellerInsightsWorkspace,
 * SellerAnalyticsWorkspace, SellerPaymentsWorkspace).
 *
 * To bring one back, set EXPO_PUBLIC_SELLER_INSIGHTS_ENABLED, ..._ANALYTICS_ENABLED or
 * ..._PAYMENTS_ENABLED to "true" in the build's environment (fixed at build time), or change
 * its default here once the feature is finished.
 */
export const SELLER_SECTIONS = {
  boost: process.env.EXPO_PUBLIC_SELLER_BOOST_ENABLED === "true",
  insights: process.env.EXPO_PUBLIC_SELLER_INSIGHTS_ENABLED === "true",
  analytics: process.env.EXPO_PUBLIC_SELLER_ANALYTICS_ENABLED === "true",
  payments: process.env.EXPO_PUBLIC_SELLER_PAYMENTS_ENABLED === "true",
} as const;

/** False only for a seller section above that is switched off; every other menu item shows. */
export function isSellerSectionOn(key: string): boolean {
  return key in SELLER_SECTIONS ? SELLER_SECTIONS[key as keyof typeof SELLER_SECTIONS] : true;
}

/**
 * Whether owners can restore a listing they archived. Off since backend PR 93:
 * `POST /v1/properties/:id/restore` is staff-only and the owner edit route
 * ignores `status`, so the old Unarchive button reported success while the
 * listing stayed archived. My Properties offers "Ask to restore" (an email to
 * support) instead. Turn this on once the API lets owners restore their own
 * archive; the screen's restore code is still there.
 */
export const OWNER_UNARCHIVE_ENABLED = false;

/**
 * Mess & Seat Share (/mess). Needs the mess API (PRD v1.0, section 2.3), which
 * is not deployed yet. Off: no navigation entry, and every /mess page is the
 * not-found page. To switch it on, set EXPO_PUBLIC_MESS_ENABLED=true and
 * redeploy: the web build is static, so the value is fixed at build time.
 *
 * EXPO_PUBLIC_MESS_FIXTURES=true answers the mess API from made-up demo data
 * instead, for development before the API exists. It is read in
 * src/features/mess/api/messApi.ts, where the bundler can drop the demo data
 * from builds without it.
 */
export const MESS_ENABLED = process.env.EXPO_PUBLIC_MESS_ENABLED === "true";
