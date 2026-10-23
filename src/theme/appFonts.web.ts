import { FontDisplay, type FontResource } from "expo-font";

/**
 * Web fonts: Latin subsets of the same files (scripts/subset-web-fonts.py),
 * about 30 KB each over the wire instead of about 165 KB.
 *
 * font-display: swap shows text in the fallback font while they load; the
 * default ("auto") left text invisible for up to 3 s on slow connections.
 * The family names match appFonts.ts, so every fonts.* token still resolves.
 */
const swap = (uri: number): FontResource => ({ uri, display: FontDisplay.SWAP });

export const appFonts = {
  Inter_400Regular: swap(require("../../assets/fonts/web/Inter_400Regular.ttf")),
  Inter_500Medium: swap(require("../../assets/fonts/web/Inter_500Medium.ttf")),
  Inter_600SemiBold: swap(require("../../assets/fonts/web/Inter_600SemiBold.ttf")),
  Inter_700Bold: swap(require("../../assets/fonts/web/Inter_700Bold.ttf")),
  Inter_800ExtraBold: swap(require("../../assets/fonts/web/Inter_800ExtraBold.ttf")),
  PlusJakartaSans_600SemiBold: swap(require("../../assets/fonts/web/PlusJakartaSans_600SemiBold.ttf")),
  PlusJakartaSans_700Bold: swap(require("../../assets/fonts/web/PlusJakartaSans_700Bold.ttf")),
  PlusJakartaSans_800ExtraBold: swap(require("../../assets/fonts/web/PlusJakartaSans_800ExtraBold.ttf")),
};
