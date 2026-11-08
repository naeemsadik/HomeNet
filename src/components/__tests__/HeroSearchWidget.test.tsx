import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import { useLanguageStore } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";

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

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: jest.fn(),
}));

jest.mock("@/components/icons", () => ({
  ChevronDown: () => "ChevronDown",
  MapPin: () => "MapPin",
  Search: () => "Search",
  SlidersHorizontal: () => "SlidersHorizontal",
  X: () => "X",
}));

describe("HeroSearchWidget", () => {
  let container: HTMLDivElement;
  const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders 'Search' on desktop/web screens to match mobile view", async () => {
    mockUseResponsive.mockReturnValue({
      isPhone: false,
      isTablet: false,
      isCompact: false,
      isDesktop: true,
      isWide: false,
      isUltrawide: false,
      isLargeScreen: false,
      isTall: false,
      width: 1200,
      height: 800,
      containerMaxWidth: 1280,
      sidebarWidth: 226,
      contentPadding: 36,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<HeroSearchWidget />);
    });

    expect(container.textContent).not.toContain("Search for Properties");
    const searchButtons = Array.from(container.querySelectorAll("div, button")).filter(
      (el) => el.getAttribute("aria-label") === "Search" || el.textContent === "Search"
    );
    expect(searchButtons.length).toBeGreaterThan(0);

    await act(async () => {
      root.unmount();
    });
  });

  it("renders 'Search' on mobile screens", async () => {
    mockUseResponsive.mockReturnValue({
      isPhone: true,
      isTablet: false,
      isCompact: false,
      isDesktop: false,
      isWide: false,
      isUltrawide: false,
      isLargeScreen: false,
      isTall: false,
      width: 390,
      height: 844,
      containerMaxWidth: 1200,
      sidebarWidth: 204,
      contentPadding: 14,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<HeroSearchWidget />);
    });

    expect(container.textContent).not.toContain("Search for Properties");
    const searchButtons = Array.from(container.querySelectorAll("div, button")).filter(
      (el) => el.getAttribute("aria-label") === "Search" || el.textContent === "Search"
    );
    expect(searchButtons.length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("Search for Properties");

    await act(async () => {
      root.unmount();
    });
  });
});

