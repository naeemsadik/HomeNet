/**
 * A listing's photos, the one place the app decides what counts as one.
 *
 * Every screen used to keep only media whose `media_type` was exactly "image".
 * The API does not always send that ("IMAGE", "photo", or no type at all), so
 * those screens showed "No photo provided" for listings that have photos: the
 * phone card only worked because it fell back to the first item. A media item
 * with a URL is a photo unless its type says video.
 */
export interface MediaLike {
  url?: string | null;
  media_type?: string | null;
  display_order?: number | null;
}

export function isListingPhoto(media: MediaLike | null | undefined): boolean {
  if (!media?.url) return false;
  return !String(media.media_type ?? "").toLowerCase().includes("video");
}

/** The photo URLs in display order. */
export function listingPhotos(media: readonly MediaLike[] | null | undefined): string[] {
  return (media ?? [])
    .filter(isListingPhoto)
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((m) => m.url as string);
}

/** The cover photo: the first photo in display order, or null. */
export function listingCover(media: readonly MediaLike[] | null | undefined): string | null {
  return listingPhotos(media)[0] ?? null;
}
