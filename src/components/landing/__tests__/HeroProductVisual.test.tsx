import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { router } from "expo-router";
import { HeroProductVisual } from "@/components/landing/HeroProductVisual";
import { useLanguageStore } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, radius } from "@/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("expo-image", () => {
  const mockReact = require("react");
  return {
    Image: ({ accessibilityLabel }: { accessibilityLabel?: string }) =>
      mockReact.createElement("img", { alt: accessibilityLabel }),
  };
});

jest.mock("@/components/PropertyCard", () => {
  const mockReact = require("react");
  return {
    PropertyCard: ({ property }: { property: { title: string } }) =>
      mockReact.createElement("div", null, property.title),
  };
});

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: jest.fn(),
}));

jest.mock("@/components/icons", () => {
  const mockReact = require("react");
  return {
    Lock: () => "Lock",
    Mail: ({ color }: { color?: string }) =>
      mockReact.createElement("span", { "data-testid": "mail-icon", "data-color": color }),
    MapPin: () => "MapPin",
    Search: () => "Search",
    ShieldCheck: () => "ShieldCheck",
  };
});

function setViewport(isPhone: boolean) {
  (useResponsive as jest.MockedFunction<typeof useResponsive>).mockReturnValue({
    width: isPhone ? 375 : 1440,
    height: isPhone ? 812 : 900,
    isPhone,
    isTablet: false,
    isCompact: false,
    isDesktop: !isPhone,
    isWide: !isPhone,
    isUltrawide: false,
    isLargeScreen: !isPhone,
    isTall: false,
    containerMaxWidth: isPhone ? 375 : 1280,
    sidebarWidth: 260,
    contentPadding: isPhone ? 16 : 24,
  });
}

describe("HeroProductVisual", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    setViewport(false);
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("uses the single brand green (#04cf92) with dark onBrand text on desktop CTAs", () => {
    const root = createRoot(container);
    act(() => {
      root.render(<HeroProductVisual />);
    });

    const contactBtn = container.querySelector('[data-testid="hero-contact-cta"]') as HTMLElement;
    const contactText = container.querySelector(
      '[data-testid="hero-contact-cta-text"]',
    ) as HTMLElement;
    expect(contactBtn).toBeTruthy();
    expect(getComputedStyle(contactBtn).backgroundColor).toBe("rgb(4, 207, 146)");
    expect(getComputedStyle(contactText).color).toBe("rgb(11, 26, 23)");
    expect(getComputedStyle(contactBtn).borderTopLeftRadius).toBe(`${radius.lg}px`);

    const mailIcon = container.querySelector('[data-testid="mail-icon"]');
    expect(mailIcon?.getAttribute("data-color")).toBe(colorTokens.onBrand);

    const searchBtn = container.querySelector('[data-testid="hero-search-cta"]') as HTMLElement;
    const searchBtnText = container.querySelector(
      '[data-testid="hero-search-cta-text"]',
    ) as HTMLElement;
    expect(getComputedStyle(searchBtn).backgroundColor).toBe("rgb(4, 207, 146)");
    expect(getComputedStyle(searchBtnText).color).toBe("rgb(11, 26, 23)");

    act(() => {
      root.unmount();
    });
  });

  it("renders the matching brand CTA on phone widths and navigates to /buy on press", () => {
    setViewport(true);
    const root = createRoot(container);
    act(() => {
      root.render(<HeroProductVisual />);
    });

    const contactBtn = container.querySelector('[data-testid="hero-contact-cta"]') as HTMLElement;
    const contactText = container.querySelector(
      '[data-testid="hero-contact-cta-text"]',
    ) as HTMLElement;
    expect(getComputedStyle(contactBtn).backgroundColor).toBe("rgb(4, 207, 146)");
    expect(getComputedStyle(contactText).color).toBe("rgb(11, 26, 23)");

    const link = container.querySelector('[role="link"]') as HTMLElement | null;
    expect(link).toBeTruthy();
    act(() => {
      link?.click();
    });
    expect(router.push).toHaveBeenCalledWith("/buy");

    act(() => {
      root.unmount();
    });
  });
});
