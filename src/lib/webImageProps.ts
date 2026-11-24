import { Platform } from "react-native";

/**
 * Browser-only `<img>` hints for a react-native-web `Image`.
 *
 * react-native-web renders `Image` as an `<img>` and forwards props it does
 * not recognise straight to it, which is how `loading` and `fetchPriority`
 * reach the DOM. Its types do not describe them, so every call site had its
 * own `as any` and they had drifted — one guarded on `typeof window`, which
 * is true on native too. This keeps the one unavoidable cast in a single
 * place behind a typed surface.
 *
 * Returns null off the web, where both props mean nothing.
 */
export interface WebImageHints {
  /** `lazy` below the fold, `eager` for the LCP image. */
  loading?: "lazy" | "eager";
  /** Only worth setting on the image that is the LCP candidate. */
  fetchPriority?: "high" | "low" | "auto";
}

export function webImageProps(hints: WebImageHints): Record<string, string> | null {
  if (Platform.OS !== "web") return null;
  return hints as unknown as Record<string, string>;
}
