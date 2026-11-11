import { useState, type ReactNode } from "react";
import { usePathname } from "expo-router";
import { buildSnapshotJson } from "@/lib/buildTimeApi";

const BLOCK_ID = "build-snapshot";

/**
 * The block in the HTML the visitor landed on. Read once: it leaves the page
 * with the first client-side navigation.
 */
let landing: { path: string | null; json: string } | null | undefined;
function landingBlock() {
  if (landing === undefined) {
    const block = document.getElementById(BLOCK_ID);
    landing = block?.textContent ? { path: block.getAttribute("data-path"), json: block.textContent } : null;
  }
  return landing;
}

function snapshotJson(pathname: string): string | undefined {
  if (typeof document === "undefined") return buildSnapshotJson(pathname);
  const block = landingBlock();
  return block?.path === pathname ? block.json : undefined;
}

/**
 * Renders the page with the data the build fetched for it (see buildTimeApi),
 * else with `undefined`.
 *
 * The data goes into the page as a JSON block, so the browser hydrates from the
 * same data the HTML was rendered with. It is a data block the browser never
 * runs, so script-src, which has no 'unsafe-inline', does not apply to it.
 *
 * Only the page the visitor landed on has that block. Other pages, and listings
 * created after the build, fetch from the API as usual.
 */
export function BuildSnapshot<T>({ render }: { render: (snapshot: T | undefined) => ReactNode }) {
  const pathname = usePathname();
  // Decided once: a screen stays mounted under the next one while the pathname
  // moves on, and switching branches here would remount the whole page.
  const [block] = useState(() => {
    const json = snapshotJson(pathname);
    return json === undefined ? null : { path: pathname, json, data: JSON.parse(json) as T };
  });
  if (!block) return <>{render(undefined)}</>;
  return (
    <>
      <script id={BLOCK_ID} type="application/json" data-path={block.path} dangerouslySetInnerHTML={{ __html: block.json }} />
      {render(block.data)}
    </>
  );
}
