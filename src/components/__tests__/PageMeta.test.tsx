import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import Head from "expo-router/head";
import { PageMeta } from "@/components/PageMeta";

let mockPathname = "/property/94ea3a90-1c2d-4e5f-8a9b-0c1d2e3f4a5b";

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("expo-router/build/useIsFocused", () => ({
  useIsFocused: () => true,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderHead(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<Head.Provider>{element}</Head.Provider>);
  });
  // react-helmet-async batches DOM head updates via requestAnimationFrame.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  return {
    domCanonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    domRobots: document.head.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
    domOgUrl: document.head.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
    cleanup: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("PageMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    mockPathname = "/property/94ea3a90-1c2d-4e5f-8a9b-0c1d2e3f4a5b";
  });

  it("emits a self-referencing canonical URL for active property pages", async () => {
    const { domCanonical, domOgUrl, domRobots, cleanup } = await renderHead(
      <>
        <PageMeta title="HomeNet BD" noCanonical />
        <PageMeta title="3 Bed Flat for Sale in Gulshan | HomeNet BD" description="Active listing" />
      </>,
    );

    expect(domCanonical).toBe("https://www.homenetbd.com/property/94ea3a90-1c2d-4e5f-8a9b-0c1d2e3f4a5b");
    expect(domOgUrl).toBe("https://www.homenetbd.com/property/94ea3a90-1c2d-4e5f-8a9b-0c1d2e3f4a5b");
    expect(domRobots).toBeNull();
    await cleanup();
  });

  it("emits noindex, follow and omits canonical + og:url when a property is missing, even under the root fallback PageMeta", async () => {
    const { domCanonical, domOgUrl, domRobots, cleanup } = await renderHead(
      <>
        <PageMeta title="HomeNet BD" noCanonical />
        <PageMeta title="Listing not found | HomeNet BD" robots="noindex, follow" noCanonical />
      </>,
    );

    expect(domRobots).toBe("noindex, follow");
    expect(domCanonical).toBeNull();
    expect(domOgUrl).toBeNull();
    await cleanup();
  });

  it("omits canonical on noindex loading/hidden pages when no canonicalPath override is supplied", async () => {
    const { domCanonical, domOgUrl, domRobots, cleanup } = await renderHead(
      <>
        <PageMeta title="HomeNet BD" noCanonical />
        <PageMeta title="Property for sale or rent in Bangladesh | HomeNet BD" noindex />
      </>,
    );

    expect(domRobots).toBe("noindex, nofollow");
    expect(domCanonical).toBeNull();
    expect(domOgUrl).toBeNull();
    await cleanup();
  });

  it("keeps canonicalPath when explicitly provided on a duplicate/alias page", async () => {
    mockPathname = "/explore";
    const { domCanonical, domRobots, cleanup } = await renderHead(
      <>
        <PageMeta title="HomeNet BD" noCanonical />
        <PageMeta canonicalPath="/buy" title="Buy Property | HomeNet BD" />
      </>,
    );

    expect(domCanonical).toBe("https://www.homenetbd.com/buy");
    expect(domRobots).toBeNull();
    await cleanup();
  });
});
