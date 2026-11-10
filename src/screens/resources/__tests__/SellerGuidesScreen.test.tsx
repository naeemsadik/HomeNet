import React from "react";
import { Pressable } from "react-native";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import {
  SellerGuidesScreen,
  SELLER_CHECKLIST_ITEMS,
  SELLER_PHASES_DATA,
  SELLER_DEEP_DIVE_GUIDES,
} from "@/screens/resources/SellerGuidesScreen";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

let mockAppChromeProps: Record<string, unknown> = {};
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode; active?: string }) => {
    mockAppChromeProps = props;
    return props.children;
  },
}));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || [])
    .map((child) => textOf(child as ReactTestInstance))
    .join(" ");
};

describe("SellerGuidesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<SellerGuidesScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one h1 with accessibilityRole='header' and aria-level={1}", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    const h1Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(h1Headers.length).toBe(1);
    expect(textOf(h1Headers[0])).toContain(en.sellerGuides.headline);
  });

  it("renders semantic h2 headings for checklist, 4 phases, guides, and faqs", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBeGreaterThanOrEqual(4);

    const fullH2Text = h2Headers.map((h) => textOf(h)).join(" ");
    expect(fullH2Text).toContain(en.sellerGuides.checklistTitle);
    expect(fullH2Text).toContain(en.sellerGuides.phasesTitle);
    expect(fullH2Text).toContain(en.sellerGuides.guidesTitle);
    expect(fullH2Text).toContain(en.sellerGuides.faqTitle);
  });

  it("displays initial checklist state with 33% readiness score and low rating text", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sellerGuides.readinessScore);
    expect(fullText).toMatch(/33\s*%/);
    expect(fullText).toContain(en.sellerGuides.scoreLow);

    // Verify all 6 checklist items are displayed
    expect(SELLER_CHECKLIST_ITEMS.length).toBe(6);
    expect(fullText).toContain(en.sellerGuides.check1Title);
    expect(fullText).toContain(en.sellerGuides.check2Title);
    expect(fullText).toContain(en.sellerGuides.check3Title);
    expect(fullText).toContain(en.sellerGuides.check4Title);
    expect(fullText).toContain(en.sellerGuides.check5Title);
    expect(fullText).toContain(en.sellerGuides.check6Title);
  });

  it("toggles checklist items and updates readiness percentage and rating dynamically", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    const checkboxes = tree!.root.findAll(
      (node) =>
        node.type === Pressable && node.props.accessibilityRole === "checkbox",
    );
    expect(checkboxes.length).toBe(6);

    // Item 0 and 1 initially checked (true), 2 is unchecked (false)
    expect(checkboxes[0].props.accessibilityState.checked).toBe(true);
    expect(checkboxes[1].props.accessibilityState.checked).toBe(true);
    expect(checkboxes[2].props.accessibilityState.checked).toBe(false);

    // Toggle item 2 to checked -> 3 of 6 -> 50%
    act(() => {
      checkboxes[2].props.onPress();
    });

    let fullText = textOf(tree!.root);
    expect(fullText).toMatch(/50\s*%/);
    expect(fullText).toContain(en.sellerGuides.scoreMedium);

    // Toggle items 3, 4, 5 to checked -> 6 of 6 -> 100%
    act(() => {
      checkboxes[3].props.onPress();
      checkboxes[4].props.onPress();
      checkboxes[5].props.onPress();
    });

    fullText = textOf(tree!.root);
    expect(fullText).toMatch(/100\s*%/);
    expect(fullText).toContain(en.sellerGuides.scoreHigh);
  });

  it("renders all 4 property selling phases with timeline and warning callouts", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    expect(SELLER_PHASES_DATA.length).toBe(4);
    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sellerGuides.phase1Title);
    expect(fullText).toContain(en.sellerGuides.phase1Time);
    expect(fullText).toContain(en.sellerGuides.phase1Warning);

    expect(fullText).toContain(en.sellerGuides.phase2Title);
    expect(fullText).toContain(en.sellerGuides.phase2Time);
    expect(fullText).toContain(en.sellerGuides.phase2Warning);

    expect(fullText).toContain(en.sellerGuides.phase3Title);
    expect(fullText).toContain(en.sellerGuides.phase3Time);
    expect(fullText).toContain(en.sellerGuides.phase3Warning);

    expect(fullText).toContain(en.sellerGuides.phase4Title);
    expect(fullText).toContain(en.sellerGuides.phase4Time);
    expect(fullText).toContain(en.sellerGuides.phase4Warning);
  });

  it("renders all 5 curated deep-dive guide cards and navigates on press", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    expect(SELLER_DEEP_DIVE_GUIDES.length).toBe(5);
    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sellerGuides.guide1Title);
    expect(fullText).toContain(en.sellerGuides.guide2Title);
    expect(fullText).toContain(en.sellerGuides.guide3Title);
    expect(fullText).toContain(en.sellerGuides.guide4Title);
    expect(fullText).toContain(en.sellerGuides.guide5Title);

    const guideLinks = tree!.root.findAll(
      (node) =>
        node.type === Pressable && node.props.accessibilityRole === "link",
    );
    expect(guideLinks.length).toBe(5);

    act(() => {
      guideLinks[0].props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith("/resources/property-valuation-guide");

    act(() => {
      guideLinks[2].props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith("/resources/stamp-duty-tax-guide");
  });

  it("toggles FAQ accordion expansion when pressing questions", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SellerGuidesScreen />);
    });

    // FAQ 1 is initially expanded
    let fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sellerGuides.faq1A);

    const faqButtons = tree!.root.findAll(
      (node) =>
        node.type === Pressable &&
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityState &&
        "expanded" in node.props.accessibilityState,
    );
    expect(faqButtons.length).toBe(4);
    expect(faqButtons[0].props.accessibilityState.expanded).toBe(true);
    expect(faqButtons[1].props.accessibilityState.expanded).toBe(false);

    // Expand FAQ 2
    act(() => {
      faqButtons[1].props.onPress();
    });

    fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sellerGuides.faq2A);

    // Collapse FAQ 1
    act(() => {
      faqButtons[0].props.onPress();
    });

    fullText = textOf(tree!.root);
    expect(fullText).not.toContain(en.sellerGuides.faq1A);
  });
});

