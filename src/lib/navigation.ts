import { router, type Href } from "expo-router";

/**
 * Going back without assuming there is anywhere to go back to.
 *
 * `router.back()` on its own throws "The action 'GO_BACK' was not handled by
 * any navigator" whenever the history stack is empty, which on the web is
 * ordinary rather than exceptional: a listing opened in a new tab, a page
 * reloaded, a `replace` that left no entry, or a jump across layout
 * navigators all arrive with nothing behind them. The button then does
 * nothing at all, which is worse than a wrong destination.
 */

/** Longer than any route this app generates; a cheap bound on parsed input. */
const MAX_RETURN_TO_LENGTH = 512;

/**
 * Whether a `returnTo` query value is a path inside this app.
 *
 * The value arrives from the URL, so it is attacker-controlled: a link to
 * `/property/123?returnTo=https://evil.com` would otherwise turn the app's
 * own Back button into an open redirect, and a phishing page that opens one
 * click after a real listing is a convincing one.
 *
 * Accepted: one leading slash, then a path. Rejected: anything that could
 * resolve to another origin.
 */
export function isSafeReturnPath(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const path = value.trim();
  if (!path || path.length > MAX_RETURN_TO_LENGTH) return false;

  // Must be an absolute path on this origin. This alone rejects
  // "https://evil.com", "evil.com" and "javascript:alert(1)".
  if (!path.startsWith("/")) return false;

  // Control characters, including the newline a header-splitting attempt uses.
  if (/[\u0000-\u001F\u007F]/.test(path)) return false;

  // A second separator makes it protocol-relative ("//evil.com"), and a
  // browser normalises a backslash to a slash, so "/\evil.com" is the same
  // attack wearing a different hat.
  const protocolRelative = /^\/[/\\]/;
  if (protocolRelative.test(path)) return false;

  // "/%2f%2fevil.com" is the same thing again, once decoded. A malformed
  // escape throws, and anything we cannot read, we do not trust.
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (protocolRelative.test(decoded)) return false;
  if (/[\u0000-\u001F\u007F]/.test(decoded)) return false;

  return true;
}

/**
 * The first `returnTo` in a query that is safe to use, or null.
 *
 * `useLocalSearchParams` hands back `string | string[]`, because a query can
 * repeat a key. Taking the first valid one means `?returnTo=/admin&returnTo=//evil.com`
 * cannot smuggle a second value past a check written for a single string.
 */
export function readReturnPath(value: string | string[] | undefined): string | null {
  const candidates = Array.isArray(value) ? value : [value];
  for (const candidate of candidates) {
    if (isSafeReturnPath(candidate)) return candidate;
  }
  return null;
}

/**
 * Goes back, or somewhere sensible when there is no back to go to.
 *
 * Order matters:
 *
 * 1. Real history wins, so Back behaves the way the browser's own Back does
 *    and keeps the person's place in a list they scrolled.
 * 2. Then a validated `returnTo`, which is what a fresh tab has instead of
 *    history — this is how a listing opened from the admin panel still
 *    returns to the admin panel after a reload.
 * 3. Then the caller's fallback, so the button always does something.
 *
 * `replace` rather than `push` for 2 and 3: the page being left is not
 * somewhere Back should return to.
 */
export function safeGoBack({
  returnTo,
  fallback,
}: {
  /** Raw query value; validated here, so callers may pass it straight through. */
  returnTo?: string | string[];
  /** Where to land when there is no history and no usable `returnTo`. */
  fallback: string;
}): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  const validated = readReturnPath(returnTo);
  router.replace((validated ?? fallback) as Href);
}

/**
 * Appends a return path to an in-app link, so the destination can offer a way
 * back even when it is opened in a new tab or reloaded.
 *
 * Skips an unsafe value rather than writing it into a URL the app will later
 * read back and trust.
 */
export function withReturnTo(href: string, returnTo: string): string {
  if (!isSafeReturnPath(returnTo)) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}
