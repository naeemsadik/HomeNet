import type { ReactNode } from "react";
import { useLoaderData, usePathname } from "expo-router";

type LoaderDataGlobal = { __EXPO_ROUTER_LOADER_DATA__?: Record<string, unknown> };

/**
 * Expo Router writes a page's loader data as an inline script that sets
 * globalThis.__EXPO_ROUTER_LOADER_DATA__. script-src has no 'unsafe-inline',
 * so scripts/loader-data-json.mjs rewrites that script into a JSON data block
 * after export (the browser never runs it), and this puts it back on the
 * global before React hydrates. Runs once, when app/_layout.tsx imports it.
 */
function adoptLoaderDataBlock() {
  const global = globalThis as LoaderDataGlobal;
  if (typeof document === "undefined" || global.__EXPO_ROUTER_LOADER_DATA__) return;
  const block = document.getElementById("expo-router-data");
  if (block?.getAttribute("type") !== "application/json" || !block.textContent) return;
  try {
    const data = JSON.parse(block.textContent) as Record<string, unknown>;
    // useLoaderData looks the data up by path plus query string, and a shared
    // link carries one ("?fbclid=…", "?utm_source=…"). The page was exported
    // for the bare path, so file the data under both, or the lookup misses and
    // the page suspends to fetch it again.
    const path = window.location.pathname;
    const search = new URLSearchParams(window.location.search).toString();
    if (search && data[path] !== undefined) data[`${path}?${search}`] = data[path];
    global.__EXPO_ROUTER_LOADER_DATA__ = data;
  } catch {
    // No snapshot: the page fetches its data in the browser, as without loaders.
  }
}
adoptLoaderDataBlock();

/**
 * Renders the page with its route loader's build-time data when the page was
 * exported with it, else with `undefined`.
 *
 * Only the page the visitor landed on has that data in its HTML. On a
 * client-side navigation useLoaderData would fetch /_expo/loaders/<path>, a
 * file that does not exist for a listing created after the build, so other
 * pages skip it and fetch from the API as before.
 */
export function BuildSnapshot<T>({ render }: { render: (snapshot: T | undefined) => ReactNode }) {
  const pathname = usePathname();
  const exported = typeof window === "undefined" || Boolean((globalThis as LoaderDataGlobal).__EXPO_ROUTER_LOADER_DATA__?.[pathname]);
  return exported ? <WithLoaderData render={render} /> : <>{render(undefined)}</>;
}

function WithLoaderData<T>({ render }: { render: (snapshot: T | undefined) => ReactNode }) {
  const data = useLoaderData() as T | null | undefined;
  return <>{render(data ?? undefined)}</>;
}
