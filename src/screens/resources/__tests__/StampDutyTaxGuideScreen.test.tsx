import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { StampDutyTaxGuideScreen } from "@/screens/resources/StampDutyTaxGuideScreen";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

let mockAppChromeProps: Record<string, unknown> = {};
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode; active?: string }) => {
    mockAppChromeProps = props;
    return props.children;
  },
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("StampDutyTaxGuideScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<StampDutyTaxGuideScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one h1 with accessibilityRole='header' and aria-level={1}", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const h1Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(h1Headers.length).toBe(1);
    expect(textOf(h1Headers[0])).toContain(en.stampDutyGuide.headline);
  });

  it("renders semantic h2 headings for all major sections", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBe(4);
    const h2Texts = h2Headers.map((h) => textOf(h));
    expect(h2Texts[0]).toContain(en.stampDutyGuide.feesTitle);
    expect(h2Texts[1]).toContain(en.stampDutyGuide.workflowTitle);
    expect(h2Texts[2]).toContain(en.stampDutyGuide.documentsTitle);
    expect(h2Texts[3]).toContain(en.stampDutyGuide.faqTitle);
  });

  it("names the fees that apply but states no percentage rate", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });
    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.stampDutyGuide.fee1Title);
    expect(fullText).toContain(en.stampDutyGuide.fee5Title);
    // Rates change with each Finance Act and are not verified here, so none is shown.
    expect(fullText).not.toMatch(/\d+(\.\d+)?\s?%/);
    expect(fullText).toContain(en.stampDutyGuide.feesNote);
  });

  it("has no calculator and no compliance badge", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });
    expect(tree!.root.findAll((n) => n.props.keyboardType === "numeric" || n.props.keyboardType === "number-pad")).toHaveLength(0);
    expect(textOf(tree!.root)).not.toMatch(/Compliant|Aligned/);
  });

  it("renders 6-step registration workflow and legal document checklist", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.stampDutyGuide.step1Title);
    expect(fullText).toContain(en.stampDutyGuide.step6Title);
    expect(fullText).toContain(en.stampDutyGuide.doc1Title);
    expect(fullText).toContain(en.stampDutyGuide.doc7Title);
  });

  it("toggles FAQ accordion items when clicked", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    // FAQ 1 is initially expanded (index 0)
    expect(textOf(tree!.root)).toContain(en.stampDutyGuide.faq1A);

    // Find FAQ 2 button
    const faq2Buttons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.stampDutyGuide.faq2Q),
    );
    expect(faq2Buttons.length).toBeGreaterThan(0);

    act(() => {
      faq2Buttons[0].props.onPress();
    });

    expect(textOf(tree!.root)).toContain(en.stampDutyGuide.faq2A);
  });

  it("renders the statutory legal disclaimer card", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.stampDutyGuide.disclaimerTitle);
    expect(fullText).toContain("Stamp Act 1899");
  });
});
