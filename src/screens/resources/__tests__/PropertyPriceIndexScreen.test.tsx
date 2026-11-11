import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import {
  PropertyPriceIndexScreen,
  DHAKA_BENCHMARKS,
} from "@/screens/resources/PropertyPriceIndexScreen";
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

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || [])
    .map((child) => textOf(child as ReactTestInstance))
    .join(" ");
};

describe("PropertyPriceIndexScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<PropertyPriceIndexScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one h1 with accessibilityRole='header' and aria-level={1}", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const h1Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(h1Headers.length).toBe(1);
    expect(textOf(h1Headers[0])).toContain(en.propertyPriceIndex.headline);
  });

  it("renders semantic h2 headings for explorer, calculator, drivers, and methodology", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBe(3); // explorer, calculator, drivers
    const texts = h2Headers.map((h) => textOf(h));
    expect(texts[0]).toContain(en.propertyPriceIndex.explorerTitle);
    expect(texts[1]).toContain(en.propertyPriceIndex.calculatorTitle);
    expect(texts[2]).toContain(en.propertyPriceIndex.driversTitle);
  });

  it("displays all 10 Dhaka benchmark neighborhoods by default", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const fullText = textOf(tree!.root);
    DHAKA_BENCHMARKS.forEach((item) => {
      expect(fullText).toContain(en.propertyPriceIndex[item.id === "bashundhara" ? "bashundharaName" : `${item.id}Name` as keyof typeof en.propertyPriceIndex]);
    });
  });

  it("filters benchmarks when a zone category tab is clicked", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    // Find and click 'Prime Residential' filter tab
    const primeTab = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.propertyPriceIndex.filterPrime),
    )[0];
    expect(primeTab).toBeDefined();

    act(() => {
      primeTab.props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Prime areas are present
    expect(fullText).toContain(en.propertyPriceIndex.gulshanName);
    expect(fullText).toContain(en.propertyPriceIndex.dhanmondiName);
    // Non-prime area is excluded from explorer cards
    expect(fullText).not.toContain(en.propertyPriceIndex.mirpurZone);
  });

  it("calculates property value accurately for Dhanmondi with 1,500 sqft default", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const fullText = textOf(tree!.root);
    // Dhanmondi default (1,500 sqft * 14,250 avg = 2,13,75,000)
    expect(fullText).toContain("৳ 2,13,75,000");
    // Range: 1500 * 11000 = 1.65 Cr to 1500 * 17500 = 2.63 Cr
    expect(fullText).toContain("৳ 1.65 Cr");
    expect(fullText).toContain("৳ 2.63 Cr");
  });

  it("updates calculator when a preset size chip is pressed (e.g. 1,000 sqft)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const chip1000 = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.propertyPriceIndex.preset1000),
    )[0];
    expect(chip1000).toBeDefined();

    act(() => {
      chip1000.props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Dhanmondi with 1000 sqft (1000 * 14,250 = 1,42,50,000)
    expect(fullText).toContain("৳ 1,42,50,000");
  });

  it("updates calculator when another area chip is selected (e.g. Gulshan)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const gulshanChips = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyPriceIndex.gulshanName,
    );
    expect(gulshanChips.length).toBeGreaterThan(0);

    act(() => {
      gulshanChips[0].props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Gulshan 1,500 sqft * 21,250 = 3,18,75,000
    expect(fullText).toContain("৳ 3,18,75,000");
  });

  it("renders key market drivers and methodology disclaimer", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyPriceIndexScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyPriceIndex.driver1Title);
    expect(fullText).toContain(en.propertyPriceIndex.driver2Title);
    expect(fullText).toContain(en.propertyPriceIndex.driver3Title);
    expect(fullText).toContain(en.propertyPriceIndex.methodologyTitle);
  });
});
