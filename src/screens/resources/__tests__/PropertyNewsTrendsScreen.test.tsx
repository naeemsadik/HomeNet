import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { PropertyNewsTrendsScreen } from "@/screens/resources/PropertyNewsTrendsScreen";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
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
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join(" ");
};

const render = () => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<PropertyNewsTrendsScreen />);
  });
  return tree!;
};

describe("PropertyNewsTrendsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("leaves no bottom tab falsely highlighted", () => {
    render();
    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("has exactly one h1", () => {
    const tree = render();
    const h1 = tree.root.findAll((n) => n.props.accessibilityRole === "header" && n.props["aria-level"] === 1);
    expect(h1).toHaveLength(1);
    expect(textOf(h1[0])).toContain(en.propertyNewsTrends.headline);
  });

  it("says plainly that there is no news yet, and invents none", () => {
    const text = textOf(render().root);
    expect(text).toContain("We do not publish news");
    expect(text).not.toMatch(/Subscribe|newsletter|read\b/i);
    expect(text).not.toMatch(/\d+(\.\d+)?\s?%/);
  });

  it("links to the three pages that hold real information", () => {
    const tree = render();
    const pressHandlers = tree.root
      .findAll((n) => n.props.accessibilityRole === "link" && typeof n.props.onPress === "function")
      .map((n) => n.props.onPress as () => void);
    const links = [...new Set(pressHandlers)];
    expect(links).toHaveLength(3);
    links.forEach((press) => act(() => press()));
    expect(mockPush.mock.calls.map((c) => c[0])).toEqual([
      "/resources/property-price-index",
      "/resources/property-valuation-guide",
      "/resources/stamp-duty-tax-guide",
    ]);
  });
});
