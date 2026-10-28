import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { MobileHeroSearchCard } from "@/components/MobileHeroSearchCard";
import { useLanguageStore } from "@/i18n";
import { router } from "expo-router";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/components/AreaPicker", () => ({
  AreaPicker: () => null,
}));

jest.mock("@/components/AdvancedFiltersModal", () => ({
  AdvancedFiltersModal: () => null,
}));

jest.mock("@/components/icons", () => ({
  Bookmark: () => "Bookmark",
  Calculator: () => "Calculator",
  ChevronRight: () => "ChevronRight",
  Search: () => "Search",
  SlidersHorizontal: () => "SlidersHorizontal",
  Sparkles: () => "Sparkles",
  X: () => "X",
}));

describe("MobileHeroSearchCard", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });

  it("renders transaction tabs and action button in English", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<MobileHeroSearchCard />);
    });

    // Segmented tabs
    expect(container.textContent).toContain("Buy");
    expect(container.textContent).toContain("Rent");
    expect(container.textContent).toContain("Holiday stay");
    expect(container.textContent).toContain("Sold");

    // Dynamic search button for Buy (default)
    expect(container.textContent).toContain("Search properties for sale");

    // Quick navigation list
    expect(container.textContent).toContain("Request property valuation");
    expect(container.textContent).toContain("Saved searches & alerts");

    await act(async () => {
      root.unmount();
    });
  });

  it("renders full localization parity in Bengali", async () => {
    useLanguageStore.getState().setLanguage("bn");
    const root = createRoot(container);

    await act(async () => {
      root.render(<MobileHeroSearchCard />);
    });

    // Segmented tabs in Bengali
    expect(container.textContent).toContain("কিনুন");
    expect(container.textContent).toContain("ভাড়া");
    expect(container.textContent).toContain("হলিডে স্টে");
    expect(container.textContent).toContain("বিক্রি হয়েছে");

    // Dynamic search button in Bengali
    expect(container.textContent).toContain("বিক্রির জন্য প্রপার্টি খুঁজুন");

    // Quick navigation list in Bengali
    expect(container.textContent).toContain("প্রপার্টি মূল্যায়নের আবেদন করুন");
    expect(container.textContent).toContain("সংরক্ষিত সার্চ ও অ্যালার্ট");

    await act(async () => {
      root.unmount();
    });
  });

  it("routes to holiday stay search when Holiday Stay tab is active", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<MobileHeroSearchCard />);
    });

    const holidayTab = container.querySelector('[aria-label="Holiday stay"]');
    expect(holidayTab).toBeTruthy();

    await act(async () => {
      holidayTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Search holiday stays");

    const primaryBtn = Array.from(container.querySelectorAll('[role="button"]')).find(
      (el) => el.textContent?.includes("Search holiday stays")
    );
    expect(primaryBtn).toBeTruthy();

    await act(async () => {
      primaryBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(router.push).toHaveBeenCalledWith("/rent?subtype=short-let&listing_type=short_let");

    await act(async () => {
      root.unmount();
    });
  });

  it("routes to valuation and saved searches", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<MobileHeroSearchCard />);
    });

    const valuationRow = container.querySelector('[aria-label="Request property valuation"]');
    expect(valuationRow).toBeTruthy();

    await act(async () => {
      valuationRow?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(router.push).toHaveBeenCalledWith("/instant-valuation");

    await act(async () => {
      root.unmount();
    });
  });
});
