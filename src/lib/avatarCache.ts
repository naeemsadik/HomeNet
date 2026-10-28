/**
 * A changed profile photo can keep the same URL (the host overwrites the file),
 * and React Native's image cache keys on the URL, so the phone went on showing the
 * old photo until the app's cache was cleared. Photos are shown with a `v` query
 * that changes whenever the person uploads or removes theirs.
 *
 * The starting value is the time the app launched, so a restart also fetches a
 * fresh copy rather than trusting a cache entry from before the change.
 */
let version = Date.now();

/** Call after a photo is uploaded or removed. */
export function bumpAvatarVersion() {
  // Strictly increasing, even for two changes in the same millisecond.
  version = Math.max(version + 1, Date.now());
}

export function avatarVersion() {
  return version;
}

/** `url` with the current photo version attached; null and empty stay as they are. */
export function withAvatarVersion(url: string | null | undefined): string | null {
  if (!url) return url ?? null;
  // A local file picked a moment ago has no cache entry to bust.
  if (/^(file|content|data|blob):/i.test(url)) return url;
  const [withoutHash, hash = ""] = url.split("#");
  const [path, query = ""] = withoutHash.split("?");
  const params = query.split("&").filter((part) => part && !part.startsWith("v="));
  params.push(`v=${version}`);
  return `${path}?${params.join("&")}${hash ? `#${hash}` : ""}`;
}
