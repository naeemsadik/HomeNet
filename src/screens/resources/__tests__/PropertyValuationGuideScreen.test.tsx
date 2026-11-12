import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import {
  PropertyValuationGuideScreen,
} from "@/screens/resources/PropertyValuationGuideScreen";
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

describe("PropertyValuationGuideScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<PropertyValuationGuideScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one h1 with accessibilityRole='header' and aria-level={1}", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const h1Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(h1Headers.length).toBe(1);
    expect(textOf(h1Headers[0])).toContain(en.propertyValuationGuide.headline);
  });

  it("renders semantic h2 headings for calculator, factors, mouza vs market, checklist, and faq", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBeGreaterThanOrEqual(5);

    const fullH2Text = h2Headers.map((h) => textOf(h)).join(" ");
    expect(fullH2Text).toContain(en.propertyValuationGuide.calculatorTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.factorsTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.mouzaVsMarketTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.checklistTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.faqTitle);
  });

  it("displays all 7 Dhaka valuation area chips", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyValuationGuide.gulshanName);
    expect(fullText).toContain(en.propertyValuationGuide.bananiName);
    expect(fullText).toContain(en.propertyValuationGuide.dhanmondiName);
    expect(fullText).toContain(en.propertyValuationGuide.bashundharaName);
    expect(fullText).toContain(en.propertyValuationGuide.uttaraName);
    expect(fullText).toContain(en.propertyValuationGuide.mirpurName);
    expect(fullText).toContain(en.propertyValuationGuide.mohammadpurName);
  });

  it("calculates property valuation accurately for Dhanmondi with 1,500 sqft apartment default", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const fullText = textOf(tree!.root);
    // Dhanmondi default: 1500 sqft * 14,250 = 2,13,75,000 (৳ 2.14 Cr)
    expect(fullText).toContain("৳ 2,13,75,000");
    expect(fullText).toContain("৳ 2.14 Cr");
    // Mouza total: 1500 * 6,200 = 93,00,000 (৳ 93.0 L)
    expect(fullText).toContain("৳ 93,00,000");
    expect(fullText).toContain("৳ 93.0 L");
  });

  it("updates calculator when another area chip is selected (e.g. Gulshan)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const gulshanChips = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyValuationGuide.gulshanName,
    );
    expect(gulshanChips.length).toBeGreaterThan(0);

    act(() => {
      gulshanChips[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Gulshan with 1,500 sqft (1500 * 21,250 = 3,18,75,000 -> ৳ 3.19 Cr)
    expect(fullText).toContain("৳ 3,18,75,000");
    expect(fullText).toContain("৳ 3.19 Cr");
  });

  it("updates calculator when switching to Land / Plot", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const landTabs = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyValuationGuide.typeLand,
    );
    expect(landTabs.length).toBeGreaterThan(0);

    act(() => {
      landTabs[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Dhanmondi default Land: 3 katha * 2.1 Cr = 6.3 Cr
    expect(fullText).toContain("৳ 6.30 Cr");
    expect(fullText).toContain("3 Katha Land");
  });

  it("updates calculator when building age or road width changes", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    // Select Wide road (1.15 multiplier)
    const wideRoadButtons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyValuationGuide.roadWide,
    );
    expect(wideRoadButtons.length).toBeGreaterThan(0);

    act(() => {
      wideRoadButtons[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Dhanmondi default: 2,13,75,000 * 1.15 = 2,45,81,250 (৳ 2.46 Cr)
    expect(fullText).toContain("৳ 2,45,81,250");
    expect(fullText).toContain("৳ 2.46 Cr");
  });

  it("toggles FAQ accordion expansion when question is pressed", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    // FAQ 2 question
    const faq2Buttons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        node.props.accessibilityRole === "button" &&
        textOf(node).includes(en.propertyValuationGuide.faq2Q),
    );
    expect(faq2Buttons.length).toBeGreaterThan(0);

    // Initial state: FAQ 2 answer not rendered
    let fullText = textOf(tree!.root);
    expect(fullText).not.toContain(en.propertyValuationGuide.faq2A);

    // Click to expand FAQ 2
    act(() => {
      faq2Buttons[0].props.onPress();
    });

    fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyValuationGuide.faq2A);
  });

  it("navigates to /instant-valuation when CTA button is pressed", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const ctaButtons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        node.props.accessibilityRole === "button" &&
        textOf(node).includes(en.propertyValuationGuide.ctaButton),
    );
    expect(ctaButtons.length).toBeGreaterThan(0);

    act(() => {
      ctaButtons[0].props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/instant-valuation");
  });
});
