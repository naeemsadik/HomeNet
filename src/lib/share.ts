import { Platform, Share } from "react-native";
import { notify } from "@/lib/alert";
import { absoluteUrl } from "@/lib/seo";

type ShareLinkInput = {
  title: string;
  /** Web defaults to the current page. */
  url?: string;
  /**
   * The page's path on the site (for example "/property/12"). The phone app has no address bar,
   * so this is how a share carries a link back to the page; without it only the title is shared.
   */
  path?: string;
};

/**
 * The address a share from the phone app points at: the page on the public site, tagged so visits
 * that came from a shared link show up as their own source in analytics.
 */
export function appShareUrl(path: string): string {
  return `${absoluteUrl(path)}?utm_source=homenet_app&utm_medium=share`;
}

/**
 * Shares a link with the platform share sheet, falling back to copying it.
 * Never claims a copy it didn't make: if copying fails, the URL is shown so
 * the user can copy it by hand.
 */
export async function shareLink({ title, url, path }: ShareLinkInput): Promise<void> {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    const link = url ?? (path ? appShareUrl(path) : undefined);
    await Share.share({ message: link ? `${title}\n${link}` : title }).catch(() => {});
    return;
  }

  const link = url ?? window.location.href;
  if (typeof navigator.share === "function") {
    // Rejects when the user closes the share sheet; nothing to report.
    await navigator.share({ title, url: link }).catch(() => {});
    return;
  }

  try {
    await navigator.clipboard.writeText(link);
    notify("Link copied", "The link is on your clipboard.");
  } catch {
    notify("Copy this link", link);
  }
}
