import type { HomeMapCanvasProps } from "./HomeMapCanvas.types";

/**
 * The home map explorer is web only for now (see HomeMapCanvas.web.tsx), and
 * HomeMapExplorer doesn't render on native. This stub keeps the import
 * resolvable for the native bundle.
 */
export function HomeMapCanvas(_props: HomeMapCanvasProps) {
  return null;
}
