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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ push: (...args: any[]) => mockPush(...args) }),
    router: { push: (...args: any[]) => mockPush(...args) },
    Link: ({ children, href, style }: any) => {
      return React.createElement("a", { href, style }, children);
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
  });

  describe("Render Hierarchy, Semantic Regions & WCAG AA Compliance", () => {
    it("renders exactly 2 semantic regions with accessible region labels", () => {
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
      expect(regionLabels).toHaveLength(2);

      expect(regionLabels).toContain(en.home.featureSections.accountBanner.ariaLabel);
      expect(regionLabels).toContain(en.home.featureSections.photoCards.regionLabel);
    });

    it("renders all 6 card links with valid href props for SSR static HTML crawlability", () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<HomeFeatureSections />);
      });

      const linkNodes = tree!.root.findAll((node: ReactTestInstance) => node.type === "a");

      const renderedHrefs = linkNodes.map((n) => n.props.href);
      expect(renderedHrefs).toEqual([
        "/sell",
        "/instant-valuation",
        "/resources/property-price-index",
        "/buy?type=commercial",
        "/mess",
        "/rent?subtype=short-let",
      ]);
      // The sign-in control opens a dialog, so it is a button and not a link.
      expect(renderedHrefs).not.toContain("/saved");
      expect(renderedHrefs).toHaveLength(6);
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
        { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 },
        { isPhone: false, isTablet: true, width: 800, containerMaxWidth: 800 },
        { isPhone: true, isTablet: false, width: 375, containerMaxWidth: 375 },
      ];

      for (const vp of viewports) {
        mockResponsive = vp;
        let tree: renderer.ReactTestRenderer;
        act(() => {
          tree = renderer.create(<HomeFeatureSections />);
        });

        const links = tree!.root.findAll((node: ReactTestInstance) => node.type === "a");
        expect(links).toHaveLength(6);
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
});
