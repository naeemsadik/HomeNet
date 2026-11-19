/**
 * The saved photos the owner took out of the edit form. The form holds each
 * photo by its address, so a saved photo is gone when its address is no longer
 * in the form's list.
 */
export function removedPhotos<T extends { url: string }>(saved: T[], inForm: { uri: string }[]): T[] {
  const kept = new Set(inForm.map((image) => image.uri));
  return saved.filter((photo) => !kept.has(photo.url));
}
