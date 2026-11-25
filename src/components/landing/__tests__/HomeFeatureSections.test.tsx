import React from "react";
import { StyleSheet, Text, View } from "react-native";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import {
  HomeFeatureSections,
} from "@/components/landing/HomeFeatureSections";
import {
  PHOTO_FEATURE_CARDS,
} from "@/content/homeFeatureSections";
import { en } from "@/i18n/locales/en";
import { bn } from "@/i18n/locales/bn";
import { colorTokens } from "@/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ push: (...args: any[]) => mockPush(...args) }),
    router: { push: (...args: any[]) => mockPush(...args) },
    Link: ({ children, href, style, ...rest }: any) => {
      return React.createElement("a", { href, style, ...rest }, children);
    },
  };
});

jest.mock("expo-image", () => {
  const React = require("react");
  return {
    Image: ({ accessibilityLabel, source, style }: any) =>
      React.createElement("img", {
        alt: accessibilityLabel,
        src: source?.uri,
        style,
      }),
  };
});

let mockResponsive = {
  isPhone: false,
  isTablet: false,
  width: 1280,
  containerMaxWidth: 1200,
};

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

describe("HomeFeatureSections & 3-Tier Rightmove Architecture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponsive = {
      isPhone: false,
      isTablet: false,
      width: 1280,
      containerMaxWidth: 1200,
    };
  });

  describe("Configuration & Route Integrity", () => {
    it("defines exactly 6 photo cards with unique IDs, destinations, and image sources", () => {
      expect(PHOTO_FEATURE_CARDS).toHaveLength(6);

      expect(PHOTO_FEATURE_CARDS.map((c) => c.id)).toEqual([
        "list-property",
        "instant-valuation",
        "property-guides",
        "commercial-property",
        "mess-accommodation",
        "holiday-stay",
      ]);

      const allIds = [
        "account-banner",
        ...PHOTO_FEATURE_CARDS.map((c) => c.id),
      ];
      expect(new Set(allIds).size).toBe(7);

      const allHrefs = PHOTO_FEATURE_CARDS.map((c) => c.href);
      expect(new Set(allHrefs).size).toBe(6);

      const allImages = PHOTO_FEATURE_CARDS.map((c) => c.imageSource);
      expect(new Set(allImages).size).toBe(6);
    });

    it("verifies all 6 routes point to legitimate HomeNet destinations", () => {
      const photoHrefs = PHOTO_FEATURE_CARDS.map((c) => c.href);
      expect(photoHrefs).toEqual([
        "/sell",
        "/instant-valuation",
        "/resources/property-price-index",
        "/buy?type=commercial",
        "/mess",
        "/rent?subtype=short-let",
      ]);
    });
  });

  describe("i18n Bilingual Parity (EN & BN)", () => {
    it("ensures all translation keys exist in both English and Bengali dictionaries", () => {
      const translationKeys = [
        "home.featureSections.accountBanner.title",
        "home.featureSections.accountBanner.subtitle",
        "home.featureSections.accountBanner.cta",
        "home.featureSections.accountBanner.ariaLabel",
        "home.featureSections.showcase.regionLabel",
        "home.featureSections.photoCards.regionLabel",
        ...PHOTO_FEATURE_CARDS.flatMap((item) => [
          item.titleKey,
          item.descriptionKey,
          item.badgeKey,
          item.imageAltKey,
        ]),
      ];

      for (const key of translationKeys) {
        const enVal = getNestedValue(en, key);
        const bnVal = getNestedValue(bn, key);

        expect(enVal).toBeDefined();
        expect(enVal?.length).toBeGreaterThan(0);

        expect(bnVal).toBeDefined();
        expect(bnVal?.length).toBeGreaterThan(0);
      }
    });

    it("ensures zero AI cards, zero orphaned utilityCards keys, and zero cta keys in EN and BN locales", () => {
      // Photo cards in en & bn: ensure no unwanted cards exist
      expect((en.home.featureSections.photoCards as any).aiFinder).toBeUndefined();
      expect((en.home.featureSections.photoCards as any).verified).toBeUndefined();
      expect((en.home.featureSections.photoCards as any).newDevelopments).toBeUndefined();
      expect((bn.home.featureSections.photoCards as any).aiFinder).toBeUndefined();
      expect((bn.home.featureSections.photoCards as any).verified).toBeUndefined();
      expect((bn.home.featureSections.photoCards as any).newDevelopments).toBeUndefined();

      // Ensure utilityCards dictionary is removed
      expect((en.home.featureSections as any).utilityCards).toBeUndefined();
      expect((bn.home.featureSections as any).utilityCards).toBeUndefined();

      // Ensure no orphaned cta keys in photo cards
      expect((en.home.featureSections.photoCards.listProperty as any).cta).toBeUndefined();
      expect((en.home.featureSections.photoCards.valuation as any).cta).toBeUndefined();
      expect((en.home.featureSections.photoCards.guides as any).cta).toBeUndefined();
      expect((en.home.featureSections.photoCards.commercial as any).cta).toBeUndefined();
      expect((en.home.featureSections.photoCards.mess as any).cta).toBeUndefined();
      expect((en.home.featureSections.photoCards.holiday as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.listProperty as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.valuation as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.guides as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.commercial as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.mess as any).cta).toBeUndefined();
      expect((bn.home.featureSections.photoCards.holiday as any).cta).toBeUndefined();

      // Config items
      for (const card of PHOTO_FEATURE_CARDS) {
        expect((card as any).ctaKey).toBeUndefined();
      }
    });
  });

  describe("Rightmove-Style Card Badges & Hover Reveal", () => {
    it("ensures all 6 photo cards define a mandatory badgeKey with valid EN and BN values", () => {
      expect(PHOTO_FEATURE_CARDS.every((card) => Boolean(card.badgeKey))).toBe(true);

      const enBadges = PHOTO_FEATURE_CARDS.map((c) => getNestedValue(en, c.badgeKey));
      const bnBadges = PHOTO_FEATURE_CARDS.map((c) => getNestedValue(bn, c.badgeKey));

      expect(enBadges).toEqual([
        "LISTING",
        "VALUATION",
        "GUIDES",
        "COMMERCIAL",
        "STUDENT & MESS",
        "HOLIDAY STAY",
      ]);
      expect(bnBadges).toEqual([
        "লিস্টিং",
        "মূল্যায়ন",
        "গাইড",
        "কমার্শিয়াল",
        "মেস ও ছাত্রাবাস",
        "হলিডে স্টে",
      ]);
    });

    it("shows badges at rest, permanently visible across all 6 photo cards (opacity: 1)", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const badgeContainers = tree!.root.findAll(
        (node: ReactTestInstance) =>
          node.type === View &&
          node.props["aria-hidden"] === true &&
          StyleSheet.flatten(node.props.style)?.top === 12
      );
      expect(badgeContainers).toHaveLength(6);

      const enBadgeTexts = [
        "LISTING",
        "VALUATION",
        "GUIDES",
        "COMMERCIAL",
        "STUDENT & MESS",
        "HOLIDAY STAY",
      ];
      badgeContainers.forEach((container, idx) => {
        const styles = StyleSheet.flatten(container.props.style);
        expect(styles.opacity ?? 1).toBe(1);
        expect(styles.position).toBe("absolute");
        expect(styles.top).toBe(12);
        expect(styles.left).toBe(12);

        // Verify the badge text matches
        const textNode = container.find(
          (node: ReactTestInstance) =>
            node.type === Text && node.props.children === enBadgeTexts[idx]
        );
        expect(textNode).toBeDefined();
      });
    });

    it("ensures each card renders a single semantic link whose accessible name matches the concise card title", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const cardTitles = [
        en.home.featureSections.photoCards.listProperty.title,
        en.home.featureSections.photoCards.valuation.title,
        en.home.featureSections.photoCards.guides.title,
        en.home.featureSections.photoCards.commercial.title,
        en.home.featureSections.photoCards.mess.title,
        en.home.featureSections.photoCards.holiday.title,
      ];

      for (const expectedTitle of cardTitles) {
        const linkNode = tree!.root.find(
          (node: ReactTestInstance) =>
            node.props.accessibilityRole === "link" &&
            node.props.accessibilityLabel === expectedTitle
        );
        expect(linkNode).toBeDefined();
      }
    });

    it("ensures pointer press/click on a card link does not apply green focus outline, while keyboard focus does", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const firstLink = tree!.root.find(
        (node: ReactTestInstance) =>
          node.props.accessibilityRole === "link" &&
          node.props.accessibilityLabel === en.home.featureSections.photoCards.listProperty.title
      );
      expect(firstLink).toBeDefined();

      // 1. Pointer click sequence: onPressIn -> onFocus (pointer-driven, matches returns false)
      act(() => {
        firstLink.props.onPressIn?.();
        firstLink.props.onFocus?.({
          nativeEvent: {
            target: {
              matches: () => false,
            },
          },
        });
      });

      // Find the row inside firstLink
      const row = firstLink.find(
        (node: ReactTestInstance) =>
          node.type === View &&
          Array.isArray(node.props.style) &&
          node.props.style.some((s: any) => s && s.flexDirection === "row")
      );
      const rowStylesPointer = StyleSheet.flatten(row.props.style);
      expect(rowStylesPointer.outlineColor).toBeUndefined();

      // 2. Keyboard focus sequence: onBlur -> onFocus (keyboard-driven with :focus-visible)
      act(() => {
        firstLink.props.onBlur?.();
        firstLink.props.onFocus?.({
          nativeEvent: {
            target: {
              matches: (selector: string) => selector === ":focus-visible",
            },
          },
        });
      });

      const rowStylesKeyboard = StyleSheet.flatten(row.props.style);
      expect(rowStylesKeyboard.outlineColor).toBe(colorTokens.brand);
      expect(rowStylesKeyboard.outlineWidth).toBe(2);
    });
  });

  describe("Render Hierarchy, Semantic Regions & WCAG AA Compliance", () => {
    it("renders exactly 3 semantic regions with accessible region labels on desktop", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const regions = tree!.root.findAll(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          Boolean(node.props.accessibilityLabel)
      );
      const regionLabels = Array.from(new Set(regions.map((r) => r.props.accessibilityLabel)));
      expect(regionLabels).toHaveLength(3);

      expect(regionLabels).toContain(en.home.featureSections.accountBanner.ariaLabel);
      expect(regionLabels).toContain(en.home.featureSections.showcase.regionLabel);
      expect(regionLabels).toContain(en.home.featureSections.photoCards.regionLabel);
    });

    it("renders all card and showcase links with valid href props for SSR static HTML crawlability", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const linkNodes = tree!.root.findAll((node: ReactTestInstance) => node.type === "a");

      const renderedHrefs = linkNodes.map((n) => n.props.href);
      expect(renderedHrefs).toEqual([
        "/buy?listing_type=sale&city=Dhaka",
        "/sell",
        "/instant-valuation",
        "/resources/property-price-index",
        "/buy?type=commercial",
        "/mess",
        "/rent?subtype=short-let",
      ]);
      // The sign-in control opens a dialog, so it is a button and not a link.
      expect(renderedHrefs).not.toContain("/saved");
      expect(renderedHrefs).toHaveLength(7);
    });

    it("enforces explicit 16:9 aspect ratio container on photo cards for CLS = 0", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const imageContainers = tree!.root.findAll(
        (node: ReactTestInstance) =>
          node.props.style &&
          (node.props.style.aspectRatio === 16 / 9 ||
            (Array.isArray(node.props.style) &&
              node.props.style.some((s: any) => s?.aspectRatio === 16 / 9)))
      );

      expect(imageContainers).toHaveLength(6);
    });

    it("renders responsive layout seamlessly across desktop, tablet, and mobile viewports", () => {
      const viewports = [
        { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200, expectedLinks: 7 },
        { isPhone: false, isTablet: true, width: 800, containerMaxWidth: 800, expectedLinks: 7 },
        { isPhone: true, isTablet: false, width: 375, containerMaxWidth: 375, expectedLinks: 6 },
      ];

      for (const vp of viewports) {
        mockResponsive = vp;
        let tree: renderer.ReactTestRenderer;
        act(() => {
          tree = renderer.create(<HomeFeatureSections />);
        });

        const links = tree!.root.findAll((node: ReactTestInstance) => node.type === "a");
        expect(links).toHaveLength(vp.expectedLinks);
      }
    });

    it("renders crisp outlined button with horizontal alignment on desktop (>= 768px)", () => {
      mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const button = tree!.root.find(
        (node: ReactTestInstance) =>
          node.props.accessibilityRole === "button" &&
          node.props.accessibilityLabel === en.home.featureSections.accountBanner.cta
      );
      expect(button).toBeDefined();

      const rawStyle =
        typeof button.props.style === "function"
          ? button.props.style({ pressed: false })
          : button.props.style;
      const buttonStyles = Array.isArray(rawStyle)
        ? Object.assign({}, ...rawStyle.filter(Boolean))
        : rawStyle;

      expect(buttonStyles.borderWidth).toBe(1.5);
      expect(buttonStyles.minHeight).toBe(44);
      expect(buttonStyles.borderRadius).toBe(10);
    });

    it("opens the sign-in modal and stays on the page instead of going to /saved", () => {
      mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
      const { useAuthModalStore } = require("@/stores/useAuthModalStore");
      const open = jest.spyOn(useAuthModalStore.getState(), "open");
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });
      const button = tree!.root.find(
        (node: ReactTestInstance) =>
          node.props.accessibilityRole === "button" &&
          node.props.accessibilityLabel === en.home.featureSections.accountBanner.cta &&
          typeof node.props.onPress === "function",
      );
      act(() => {
        button.props.onPress();
      });
      expect(open).toHaveBeenCalledWith();
      expect(mockPush).not.toHaveBeenCalled();
      open.mockRestore();
    });
  });

  describe("Option A Hierarchy & ProductPreviewShowcase Integration", () => {
    it("renders Option A hierarchy in exact order: AccountPromptBanner -> ProductPreviewShowcase -> 6 FeaturePhotoCard items", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const regions = tree!.root.findAll(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          Boolean(node.props.accessibilityLabel)
      );
      expect(regions).toHaveLength(3);

      // Tier 1: Account Prompt Banner
      expect(regions[0].props.accessibilityLabel).toBe(en.home.featureSections.accountBanner.ariaLabel);
      const bannerBtn = regions[0].find(
        (n: ReactTestInstance) =>
          n.props.accessibilityRole === "button" &&
          n.props.accessibilityLabel === en.home.featureSections.accountBanner.cta
      );
      expect(bannerBtn).toBeDefined();

      // Tier 2: Product Preview Showcase
      expect(regions[1].props.accessibilityLabel).toBe(en.home.featureSections.showcase.regionLabel);
      const showcaseLink = regions[1].find(
        (n: ReactTestInstance) =>
          n.props.accessibilityRole === "link" &&
          n.props.accessibilityLabel === "Browse verified properties for sale in Dhaka"
      );
      expect(showcaseLink).toBeDefined();

      // Tier 3: 6 Photo Cards Grid
      expect(regions[2].props.accessibilityLabel).toBe(en.home.featureSections.photoCards.regionLabel);
      const photoLinks = regions[2].findAll(
        (n: ReactTestInstance) => n.type === "a" && n.props.href !== "/buy?listing_type=sale&city=Dhaka"
      );
      expect(photoLinks).toHaveLength(6);
      expect(photoLinks.map((l: ReactTestInstance) => l.props.href)).toEqual([
        "/sell",
        "/instant-valuation",
        "/resources/property-price-index",
        "/buy?type=commercial",
        "/mess",
        "/rent?subtype=short-let",
      ]);
    });

    it("renders ProductPreviewShowcase with link to /buy?listing_type=sale&city=Dhaka and zero AI claims", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const showcaseLink = tree!.root.find(
        (node: ReactTestInstance) =>
          node.props.accessibilityRole === "link" &&
          node.props.accessibilityLabel === "Browse verified properties for sale in Dhaka"
      );
      expect(showcaseLink).toBeDefined();

      const linkWrapper = tree!.root.findAll((node: ReactTestInstance) => node.type === "a")[0];
      expect(linkWrapper.props.href).toBe("/buy?listing_type=sale&city=Dhaka");

      const regions = tree!.root.findAll(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          node.props.accessibilityLabel === en.home.featureSections.showcase.regionLabel
      );
      expect(regions).toHaveLength(1);

      const textNodes = regions[0].findAllByType(Text);
      const allText = textNodes.map((n) => n.props.children).flat().join(" ");

      expect(allText).toContain("Properties for Sale in Dhaka");
      expect(allText).toContain("VERIFIED LISTING");
      expect(allText).toContain("Road 92, Gulshan-2, Dhaka");
      expect(allText).toContain("৳ 4.85 Cr");
      expect(allText).toContain("Contact Owner Directly");
      expect(allText).toContain("Tanvir Rahman");

      expect(allText.toLowerCase()).not.toContain("ai finder");
      expect(allText.toLowerCase()).not.toContain("ai match");
      expect(allText.toLowerCase()).not.toContain("ai search");
      expect(allText.toLowerCase()).not.toContain("ai-powered");
      expect(allText.toLowerCase()).not.toContain("smart ai");
    });

    it("ensures pointer press/click on ProductPreviewShowcase does not apply green focus outline, while keyboard focus does", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const showcaseLink = tree!.root.find(
        (node: ReactTestInstance) =>
          node.props.accessibilityRole === "link" &&
          node.props.accessibilityLabel === "Browse verified properties for sale in Dhaka"
      );
      expect(showcaseLink).toBeDefined();

      const showcaseRegion = tree!.root.find(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          node.props.accessibilityLabel === en.home.featureSections.showcase.regionLabel
      );

      // 1. Pointer click sequence: onPressIn -> onFocus (pointer-driven, matches returns false)
      act(() => {
        showcaseLink.props.onPressIn?.();
        showcaseLink.props.onFocus?.({
          nativeEvent: {
            target: {
              matches: () => false,
            },
          },
        });
      });

      const browserFramePointer = showcaseRegion.find(
        (node: ReactTestInstance) =>
          node.type === View &&
          Array.isArray(node.props.style) &&
          node.props.style.some((s: any) => s && s.borderRadius === 16)
      );
      const frameStylesPointer = StyleSheet.flatten(browserFramePointer.props.style);
      expect(frameStylesPointer.outlineColor).toBeUndefined();

      // 2. Keyboard focus sequence: onBlur -> onFocus (keyboard-driven with :focus-visible)
      act(() => {
        showcaseLink.props.onBlur?.();
        showcaseLink.props.onFocus?.({
          nativeEvent: {
            target: {
              matches: (selector: string) => selector === ":focus-visible",
            },
          },
        });
      });

      const browserFrameKeyboard = showcaseRegion.find(
        (node: ReactTestInstance) =>
          node.type === View &&
          Array.isArray(node.props.style) &&
          node.props.style.some((s: any) => s && s.borderRadius === 16)
      );
      const frameStylesKeyboard = StyleSheet.flatten(browserFrameKeyboard.props.style);
      expect(frameStylesKeyboard.outlineColor).toBe(colorTokens.brand);
      expect(frameStylesKeyboard.outlineWidth).toBe(2);
    });

    it("applies 24px spatial rhythm on desktop and 20px on tablet between tiers", () => {
      // Desktop (>= 1024px)
      mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
      let treeDesktop: renderer.ReactTestRenderer;
      act(() => {
        treeDesktop = renderer.create(<HomeFeatureSections />);
      });
      const desktopRootView = treeDesktop!.root.findByType(View);
      const desktopStyles = StyleSheet.flatten(desktopRootView.props.style);
      expect(desktopStyles.gap).toBe(24);

      // Tablet (768px-1023px)
      mockResponsive = { isPhone: false, isTablet: true, width: 800, containerMaxWidth: 800 };
      let treeTablet: renderer.ReactTestRenderer;
      act(() => {
        treeTablet = renderer.create(<HomeFeatureSections />);
      });
      const tabletRootView = treeTablet!.root.findByType(View);
      const tabletStyles = StyleSheet.flatten(tabletRootView.props.style);
      expect(tabletStyles.gap).toBe(20);
    });

    it("enforces 8pt section breathing room (40px desktop, 32px tablet) from phone bezel to the 6-card grid", () => {
      // Desktop (>= 1024px): 24px container gap + 16px showcase marginBottom = 40px (5 x 8pt)
      mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
      let treeDesktop: renderer.ReactTestRenderer;
      act(() => {
        treeDesktop = renderer.create(<HomeFeatureSections />);
      });
      const desktopContainer = treeDesktop!.root.findByType(View);
      const desktopContainerStyles = StyleSheet.flatten(desktopContainer.props.style);
      expect(desktopContainerStyles.gap).toBe(24);

      const desktopShowcaseRegion = treeDesktop!.root.find(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          node.props.accessibilityLabel === en.home.featureSections.showcase.regionLabel
      );
      const desktopShowcaseStyles = StyleSheet.flatten(desktopShowcaseRegion.props.style);
      expect(desktopShowcaseStyles.marginBottom).toBe(16);

      const desktopTotalClearance = (desktopContainerStyles.gap ?? 0) + (desktopShowcaseStyles.marginBottom ?? 0);
      expect(desktopTotalClearance).toBe(40); // 5 x 8pt

      // Tablet (768px-1023px): 20px container gap + 12px showcase marginBottom = 32px (4 x 8pt)
      mockResponsive = { isPhone: false, isTablet: true, width: 800, containerMaxWidth: 800 };
      let treeTablet: renderer.ReactTestRenderer;
      act(() => {
        treeTablet = renderer.create(<HomeFeatureSections />);
      });
      const tabletContainer = treeTablet!.root.findByType(View);
      const tabletContainerStyles = StyleSheet.flatten(tabletContainer.props.style);
      expect(tabletContainerStyles.gap).toBe(20);

      const tabletShowcaseRegion = treeTablet!.root.find(
        (node: ReactTestInstance) =>
          (node.props.role === "region" || node.props.accessibilityRole === "region") &&
          node.props.accessibilityLabel === en.home.featureSections.showcase.regionLabel
      );
      const tabletShowcaseStyles = StyleSheet.flatten(tabletShowcaseRegion.props.style);
      expect(tabletShowcaseStyles.marginBottom).toBe(12);

      const tabletTotalClearance = (tabletContainerStyles.gap ?? 0) + (tabletShowcaseStyles.marginBottom ?? 0);
      expect(tabletTotalClearance).toBe(32); // 4 x 8pt
    });

    it("keeps every section full width at 768px, 1024px, 1280px, and 1440px", () => {
      const viewports = [
        { width: 768, isTablet: true },
        { width: 1024, isTablet: false },
        { width: 1280, isTablet: false },
        { width: 1440, isTablet: false },
      ];

      for (const vp of viewports) {
        mockResponsive = { isPhone: false, isTablet: vp.isTablet, width: vp.width, containerMaxWidth: 1200 };
        let tree: renderer.ReactTestRenderer;
        act(() => {
          tree = renderer.create(<HomeFeatureSections />);
        });

        const regions = tree!.root.findAll(
          (node: ReactTestInstance) =>
            (node.props.role === "region" || node.props.accessibilityRole === "region") &&
            Boolean(node.props.accessibilityLabel)
        );
        expect(regions).toHaveLength(3);

        for (const r of regions) {
          const regionStyles = StyleSheet.flatten(r.props.style);
          expect(regionStyles.width).toBe("100%");
        }
      }
    });

    it.each([
      [768, "row-reverse"],
      [1024, "row-reverse"],
      [1280, "row"],
    ])("keeps the preview listing's words clear of the phone mockup at %ipx", (width, direction) => {
      mockResponsive = { isPhone: false, isTablet: width < 1024, width, containerMaxWidth: 1200 };
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });
      const body = tree!.root.findAll((node) => node.props.testID === "preview-listing-body")[0];
      expect(StyleSheet.flatten(body.props.style).flexDirection).toBe(direction);
    });
  });
});
