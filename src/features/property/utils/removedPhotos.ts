/**
 * The saved photos the owner took out of the edit form. The form holds each
 * photo by its address, so a saved photo is gone when its address is no longer
 * in the form's list.
 */
export function removedPhotos<T extends { url: string }>(saved: T[], inForm: { uri: string }[]): T[] {
  const kept = new Set(inForm.map((image) => image.uri));
  return saved.filter((photo) => !kept.has(photo.url));
}

/**
 * Saves the photo changes of one edit: new photos go up first, then removed ones
 * come down. A listing that must keep a photo never passes through having none,
 * which matters because the API refuses to remove the last photo.
 */
export async function applyPhotoEdits<T extends { url: string }>({
  saved,
  inForm,
  upload,
  remove,
}: {
  saved: T[];
  inForm: { uri: string; file?: Blob | File }[];
  upload: (file: Blob | File) => Promise<unknown>;
  remove: (photo: T) => Promise<unknown>;
}): Promise<void> {
  for (const image of inForm) {
    if (image.file && !image.uri.startsWith("http")) await upload(image.file);
  }
  for (const photo of removedPhotos(saved, inForm)) await remove(photo);
}
