import type { ReactNode } from "react";

/**
 * Native: the app has no exported HTML and no build snapshots, so every page
 * fetches from the API. The web version is buildSnapshot.web.tsx.
 */
export function BuildSnapshot<T>({ render }: { render: (snapshot: T | undefined) => ReactNode }) {
  return <>{render(undefined)}</>;
}
