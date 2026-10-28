import type { UploadInput } from "@/services/upload";
import type { WizardMediaItem } from "../stores/propertyWizardStore";

/** What the API returns for a stored photo or video. */
export interface StoredMedia {
  id: string;
  url: string;
  display_order: number;
  media_type: "image" | "video";
}

/**
 * Uploads the photos and videos still on the device, one at a time, in the order
 * they were added; each keeps its place in the list as its display order.
 *
 * `onUploaded` runs as soon as each one is stored, so if an upload fails the ones
 * before it are already swapped for their stored copies and a retry sends only
 * what is left.
 */
export async function uploadLocalMedia(
  items: WizardMediaItem[],
  upload: (file: UploadInput, mediaType: "image" | "video", displayOrder: number) => Promise<StoredMedia>,
  onUploaded: (localId: string, stored: WizardMediaItem) => void,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const pending = items.filter((item): item is WizardMediaItem & { file: UploadInput } => item.file !== undefined);
  for (const [done, item] of pending.entries()) {
    onProgress?.(done, pending.length);
    const stored = await upload(item.file, item.mediaType, items.indexOf(item));
    onUploaded(item.id, {
      id: stored.id,
      url: stored.url,
      displayOrder: stored.display_order,
      mediaType: stored.media_type,
      name: item.name,
    });
  }
}
