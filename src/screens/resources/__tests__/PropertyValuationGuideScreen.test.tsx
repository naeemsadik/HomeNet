import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { PropertyValuationGuideScreen } from "@/screens/resources/PropertyValuationGuideScreen";
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

  it("renders semantic h2 headings for factors, mouza vs market, checklist, and faq", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBeGreaterThanOrEqual(4);

    const fullH2Text = h2Headers.map((h) => textOf(h)).join(" ");
    expect(fullH2Text).toContain(en.propertyValuationGuide.factorsTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.mouzaVsMarketTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.checklistTitle);
    expect(fullH2Text).toContain(en.propertyValuationGuide.faqTitle);
  });

  it("has no made-up valuation calculator and no unsourced badges", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyValuationGuideScreen />);
    });
    expect(tree!.root.findAll((n) => n.props.keyboardType === "numeric" || n.props.keyboardType === "number-pad")).toHaveLength(0);
    expect(textOf(tree!.root)).not.toMatch(/Surveyor Enlisted|RAJUK & Mouza Aligned/);
  });

  it("states no invented percentage or multiple", () => {
    for (const [key, value] of Object.entries(en.propertyValuationGuide)) {
      expect({ key, hasPercent: /\d\s?%/.test(value) }).toEqual({ key, hasPercent: false });
    }
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
