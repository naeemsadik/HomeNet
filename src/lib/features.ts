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
