import { SUPPORT_EMAIL } from "@/content/legal";

/**
 * The email a user sends to report a listing. Google Play requires a way to
 * report user-generated content from inside the app; this opens the phone's mail
 * app with the listing already named, so the report reaches us with what we need
 * to find it.
 */
export function reportListingMailto({ id, title }: { id: string; title: string }): string {
  const subject = `Report listing ${id}`;
  const body = `Listing: ${title}\nID: ${id}\n\nWhat is wrong with this listing?\n`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
