import { Linking, Platform } from "react-native";

const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * True only for absolute URLs with a scheme we are willing to open. Rejects
 * `javascript:`, `data:`, relative paths and anything that fails to parse,
 * guide content and links can come from the API.
 */
export function isSafeLinkUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return SAFE_LINK_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

/**
 * The URL as it will be opened, or null when it cannot be made safe.
 * `tel:` keeps only digits, a leading + and the dialling characters ,;# *;
 * `mailto:` must name one plausible address (the ?subject=&body= part is kept).
 */
export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!isSafeLinkUrl(url)) return null;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("tel:")) {
    const number = trimmed.slice(4).replace(/[^\d+*#,;]/g, "");
    const clean = number.replace(/(?!^)\+/g, "");
    return /\d/.test(clean) ? `tel:${clean}` : null;
  }
  if (lower.startsWith("mailto:")) {
    const rest = trimmed.slice(7);
    const q = rest.indexOf("?");
    let address: string;
    try {
      address = decodeURIComponent(q === -1 ? rest : rest.slice(0, q)).trim();
    } catch {
      return null; // a malformed % sequence
    }
    if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(address)) return null;
    // Only subject and body may follow the address: cc= and bcc= would add hidden recipients.
    const kept = q === -1
      ? []
      : rest
          .slice(q + 1)
          .split("&")
          .filter((pair) => /^(subject|body)=/i.test(pair));
    return `mailto:${encodeURIComponent(address).replace(/%40/g, "@")}${kept.length ? `?${kept.join("&")}` : ""}`;
  }
  return trimmed;
}

/**
 * Opens `url` in a new tab (web) or the OS handler (native). Does nothing and
 * returns false for unsafe URLs. `onError` runs when the OS has no app for it
 * (for example no email client).
 */
export function openExternalUrl(url: string | null | undefined, onError?: () => void): boolean {
  const safe = sanitizeExternalUrl(url);
  if (!safe) return false;

  // Web pages open in a new tab; mailto: and tel: go to the OS handler, on web too.
  if (Platform.OS === "web" && typeof window !== "undefined" && /^https?:/i.test(safe)) {
    window.open(safe, "_blank", "noopener,noreferrer");
  } else {
    Linking.openURL(safe).catch(() => onError?.());
  }
  return true;
}
