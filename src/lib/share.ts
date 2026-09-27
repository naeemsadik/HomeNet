import { Platform, Share } from "react-native";
import { notify } from "@/lib/alert";

type ShareLinkInput = {
  title: string;
  /** Web defaults to the current page. Native has no page URL, so shares the title alone. */
  url?: string;
};

/**
 * Shares a link with the platform share sheet, falling back to copying it.
 * Never claims a copy it didn't make: if copying fails, the URL is shown so
 * the user can copy it by hand.
 */
export async function shareLink({ title, url }: ShareLinkInput): Promise<void> {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    await Share.share({ message: url ? `${title}\n${url}` : title }).catch(() => {});
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
