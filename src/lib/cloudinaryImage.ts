import { Platform } from "react-native";

/**
 * Cloudinary delivers a transformed image when the instructions are written
 * into the URL path, so asking for the right size costs nothing but a string.
 *
 * Uploads are stored at full camera resolution (up to 3260x1536, ~3 MB each).
 * Every public surface was rendering those originals into boxes a few hundred
 * pixels wide, which is where ~22 MB of the homepage's 24.7 MB went.
 *
 *   format : a browser gets `f_auto`, which picks AVIF or WebP from what it accepts. The Android
 *            app does not send that header, so `f_auto` can hand it the original JPEG; it asks for
 *            `f_webp`, which every Android version decodes, so the phone never receives JPEG.
 *   q_auto : quality chosen per image rather than a fixed number
 *   c_fill : crop to the requested box, so the delivered aspect ratio matches
 *             the layout box and the image is never squashed
 */
const UPLOAD = "/image/upload/";

/** The format instruction: AVIF/WebP by negotiation in a browser, WebP outright in the app. */
export const CDN_FORMAT = Platform.OS === "web" ? "f_auto" : "f_webp";

/**
 * @param url Cloudinary delivery URL. Anything else is returned untouched.
 * @param w   Width to fetch, in device pixels. Pass ~2x the CSS width so the
 *            image stays sharp on retina screens.
 * @param h   Optional height. Supplying it enables `c_fill`, which is what
 *            fixes Lighthouse's "incorrect aspect ratio" warning.
 */
export function cdnImage(
  url: string | undefined | null,
  w: number,
  h?: number,
): string | undefined {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes(UPLOAD)) {
    return url ?? undefined;
  }

  const [prefix, rest] = url.split(UPLOAD);

  // An untransformed URL has the version segment (`v1788701402/`) immediately
  // after /image/upload/. If something else is there the URL already carries a
  // transform: a stored thumbnail_url, say, and chaining a second one onto it
  // would only cost another round of processing for no gain.
  if (!/^v\d+\//.test(rest)) return url;

  const transform = [
    CDN_FORMAT,
    "q_auto",
    `w_${Math.round(w)}`,
    ...(h ? [`h_${Math.round(h)}`, "c_fill"] : []),
  ].join(",");

  return `${prefix}${UPLOAD}${transform}/${rest}`;
}

/**
 * The same for a photo from Unsplash, whose `auto=format` also decides by request header and so
 * leaves the Android app with JPEG. The app asks for WebP outright (`fm=webp`); a browser keeps
 * `auto=format` and gets AVIF or WebP. Anything that is not an Unsplash URL is returned untouched.
 */
export function stockImage(url: string): string;
export function stockImage(url: string | undefined | null): string | undefined;
export function stockImage(url: string | undefined | null): string | undefined {
  if (!url || Platform.OS === "web" || !url.includes("images.unsplash.com")) return url ?? undefined;
  return url.replace("auto=format", "fm=webp");
}
