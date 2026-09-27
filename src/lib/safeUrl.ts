import { Linking, Platform } from "react-native";

const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * True only for absolute URLs with a scheme we are willing to open. Rejects
 * `javascript:`, `data:`, relative paths and anything that fails to parse —
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

/** Opens `url` in a new tab (web) or the OS handler (native). Does nothing and returns false for unsafe URLs. */
export function openExternalUrl(url: string | null | undefined): boolean {
  if (!isSafeLinkUrl(url)) return false;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    void Linking.openURL(url).catch(() => {});
  }
  return true;
}
