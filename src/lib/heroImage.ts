import { stockImage } from "@/lib/cloudinaryImage";

/**
 * The homepage hero is the Largest Contentful Paint element, and it is drawn as
 * a CSS background: invisible to the browser's preload scanner until the JS
 * bundle has downloaded, parsed and rendered. That cost ~1.3 s of dead wait.
 *
 * `app/+html.tsx` preloads this exact URL in the document head so the download
 * starts immediately, in parallel with the bundle. The preload only pays off if
 * the two URLs are byte-identical, which is why this constant exists rather
 * than the string being written out twice.
 *
 * 1600px covers a 1440 viewport; the previous 2400 was larger than any desktop
 * layout could use.
 */
export const HERO_IMAGE_URL = stockImage(
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
);

/**
 * The same photograph at the size a phone needs. The phone's hero is 412 px wide (about 830 px on
 * a sharp screen), so the 1600 px file above was twice the bytes it could ever show there.
 */
export const HERO_IMAGE_MOBILE_URL = stockImage(
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=75",
);
