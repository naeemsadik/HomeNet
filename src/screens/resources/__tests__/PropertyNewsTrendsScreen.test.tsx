import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import {
  PropertyNewsTrendsScreen,
} from "@/screens/resources/PropertyNewsTrendsScreen";
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

describe("PropertyNewsTrendsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<PropertyNewsTrendsScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one h1 with accessibilityRole='header' and aria-level={1}", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const h1Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(h1Headers.length).toBe(1);
    expect(textOf(h1Headers[0])).toContain(en.propertyNewsTrends.headline);
  });

  it("renders semantic h2 headings for featured analysis, intelligence grid, and snapshot", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const h2Headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(h2Headers.length).toBeGreaterThanOrEqual(3);

    const fullH2Text = h2Headers.map((h) => textOf(h)).join(" ");
    expect(fullH2Text).toContain(en.propertyNewsTrends.featuredTitle);
    expect(fullH2Text).toContain(en.propertyNewsTrends.gridTitle);
    expect(fullH2Text).toContain(en.propertyNewsTrends.snapshotTitle);
  });

  it("renders all 5 curated articles and the featured story by default", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyNewsTrends.featuredTitle);
    expect(fullText).toContain(en.propertyNewsTrends.art1Title);
    expect(fullText).toContain(en.propertyNewsTrends.art2Title);
    expect(fullText).toContain(en.propertyNewsTrends.art3Title);
    expect(fullText).toContain(en.propertyNewsTrends.art4Title);
    expect(fullText).toContain(en.propertyNewsTrends.art5Title);
  });

  it("filters articles when clicking Infrastructure Corridors tab", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const infraTab = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyNewsTrends.tabInfrastructure,
    )[0];
    expect(infraTab).toBeDefined();

    act(() => {
      infraTab.props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Infrastructure articles (art 1 and art 4) should be present
    expect(fullText).toContain(en.propertyNewsTrends.art1Title);
    expect(fullText).toContain(en.propertyNewsTrends.art4Title);
    // Other articles (art 2, art 3, art 5) should be hidden
    expect(fullText).not.toContain(en.propertyNewsTrends.art2Title);
    expect(fullText).not.toContain(en.propertyNewsTrends.art3Title);
    expect(fullText).not.toContain(en.propertyNewsTrends.art5Title);
  });

  it("filters articles when clicking Market Trends tab", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const marketTab = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).trim() === en.propertyNewsTrends.tabMarketTrends,
    )[0];
    expect(marketTab).toBeDefined();

    act(() => {
      marketTab.props.onPress();
    });

    const fullText = textOf(tree!.root);
    // Market trends articles (art 3 and art 5) should be present
    expect(fullText).toContain(en.propertyNewsTrends.art3Title);
    expect(fullText).toContain(en.propertyNewsTrends.art5Title);
    // Infrastructure (art 1, art 4) should be hidden
    expect(fullText).not.toContain(en.propertyNewsTrends.art1Title);
    expect(fullText).not.toContain(en.propertyNewsTrends.art4Title);
  });

  it("renders Quarterly Market Snapshot benchmarks", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyNewsTrends.stat1Label);
    expect(fullText).toContain(en.propertyNewsTrends.stat1Value);
    expect(fullText).toContain(en.propertyNewsTrends.stat2Label);
    expect(fullText).toContain(en.propertyNewsTrends.stat2Value);
    expect(fullText).toContain(en.propertyNewsTrends.stat3Label);
    expect(fullText).toContain(en.propertyNewsTrends.stat3Value);
  });

  it("handles newsletter subscription correctly", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PropertyNewsTrendsScreen />);
    });

    const input = tree!.root.findByProps({
      placeholder: en.propertyNewsTrends.emailPlaceholder,
    });
    expect(input).toBeDefined();

    act(() => {
      input.props.onChangeText("investor@homenet.com");
    });

    const subscribeButton = tree!.root.findAll(
      (node) =>
        node.props.onPress &&
        textOf(node).includes(en.propertyNewsTrends.subscribeButton),
    )[0];
    expect(subscribeButton).toBeDefined();

    act(() => {
      subscribeButton.props.onPress();
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.propertyNewsTrends.subscribedSuccess);
  });
});

