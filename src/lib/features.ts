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
 * Google and Facebook sign-in buttons. The API has no social-login routes yet,
 * so a tap only says "coming soon". That is tolerable on the website, which is
 * unchanged, but a store reviewer reads a button that does nothing as broken, so
 * the Android app hides them. Set EXPO_PUBLIC_SOCIAL_LOGIN_ENABLED=true in the
 * build environment once the routes exist.
 */
export const SOCIAL_LOGIN_VISIBLE =
  Platform.OS === "web" || process.env.EXPO_PUBLIC_SOCIAL_LOGIN_ENABLED === "true";
