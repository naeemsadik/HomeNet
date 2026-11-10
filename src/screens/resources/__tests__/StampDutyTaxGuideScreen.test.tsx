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
    expect(h2Texts[0]).toContain(en.stampDutyGuide.calculatorTitle);
    expect(h2Texts[1]).toContain(en.stampDutyGuide.workflowTitle);
    expect(h2Texts[2]).toContain(en.stampDutyGuide.documentsTitle);
    expect(h2Texts[3]).toContain(en.stampDutyGuide.faqTitle);
  });

  it("calculates default 1 Crore in Dhaka City Corp accurately (8.5% total)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const fullText = textOf(tree!.root);
    // 1 Crore defaults
    // Stamp Duty 1.5% = 1,50,000
    expect(fullText).toContain("৳ 1,50,000");
    // Registration Fee 1.0% = 1,00,000
    expect(fullText).toContain("৳ 1,00,000");
    // Local Govt Tax 2.0% = 2,00,000
    expect(fullText).toContain("৳ 2,00,000");
    // AIT 4.0% = 4,00,000
    expect(fullText).toContain("৳ 4,00,000");
    // Total Statutory = 8,50,000 (8.50%)
    expect(fullText).toContain("৳ 8,50,000");
    expect(fullText).toContain("8.50%");
  });

  it("updates calculation when selecting a preset chip (e.g. 50 Lakh)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const presetChips = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.stampDutyGuide.preset50L),
    );
    expect(presetChips.length).toBeGreaterThan(0);

    act(() => {
      presetChips[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // 50 Lakh (5,000,000) * 8.5% = 4,25,000
    expect(fullText).toContain("৳ 4,25,000");
  });

  it("updates calculation when selecting Rural location (LGT 1%, AIT 1%)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const ruralOptions = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.stampDutyGuide.locRural),
    );
    expect(ruralOptions.length).toBeGreaterThan(0);

    act(() => {
      ruralOptions[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // 1 Crore with:
    // Stamp Duty: 1.5% = 1,50,000
    // Reg Fee: 1.0% = 1,00,000
    // LGT: 1.0% = 1,00,000
    // AIT: 1.0% = 1,00,000
    // Total: 4.5% = 4,50,000
    expect(fullText).toContain("৳ 4,50,000");
    expect(fullText).toContain("4.50%");
  });

  it("calculates developer VAT (2% for <= 1600 sq ft, 4.5% for > 1600 sq ft)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StampDutyTaxGuideScreen />);
    });

    const devButtons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.stampDutyGuide.typeDeveloper),
    );
    expect(devButtons.length).toBeGreaterThan(0);

    act(() => {
      devButtons[0].props.onPress();
    });

    let fullText = textOf(tree!.root);
    // Dhaka City Corp + Developer (under 1600 sq ft):
    // 8.5% + 2% VAT = 10.5% = 10,50,000 BDT
    expect(fullText).toContain("৳ 10,50,000");
    expect(fullText).toContain("10.50%");

    // Now switch to over 1600 sq ft (4.5% VAT)
    const over1600Buttons = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.stampDutyGuide.sizeOver1600),
    );
    expect(over1600Buttons.length).toBeGreaterThan(0);

    act(() => {
      over1600Buttons[0].props.onPress();
    });

    fullText = textOf(tree!.root);
    // 8.5% + 4.5% VAT = 13.0% = 13,00,000 BDT
    expect(fullText).toContain("৳ 13,00,000");
    expect(fullText).toContain("13.00%");
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
