import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { PropertyPriceIndexScreen } from "@/screens/resources/PropertyPriceIndexScreen";
import { getAreaPriceIndex } from "@/features/valuation/utils/areaPriceIndex";
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
    tree = renderer.create(<PropertyPriceIndexScreen />);
  });
  return tree!;
};

describe("getAreaPriceIndex", () => {
  const stats = (n: number, status: "ok" | "thin" | "insufficient", share = 0.4) => ({
    n,
    median: 10000,
    p25: 8000,
    p75: 12000,
    largestSourceShare: share,
    status,
  });
  const data = {
    asOf: "2026-10-30",
    sources: [{ name: "a", listingsRead: 1 }],
    totals: { kept: 70 },
    areas: {
      gulshan: { sale: { ...stats(40, "ok"), median: 17000 } },
      mirpur: { sale: { ...stats(18, "ok", 0.8) } },
      uttara: { sale: stats(13, "thin") },
      badda: { sale: stats(3, "insufficient") },
      farmgate: {},
    },
  };

  it("publishes only areas with enough listings, highest price first", () => {
    const index = getAreaPriceIndex(data);
    expect(index.published.map((r) => r.key)).toEqual(["gulshan", "mirpur"]);
  });

  it("lists thin areas as still being collected, not as prices", () => {
    const index = getAreaPriceIndex(data);
    expect(index.building).toEqual([
      { key: "uttara", listings: 13 },
      { key: "badda", listings: 3 },
    ]);
  });

  it("flags an area that leans on one site", () => {
    const rows = getAreaPriceIndex(data).published;
    expect(rows.find((r) => r.key === "gulshan")!.mostlyOneSite).toBe(false);
    expect(rows.find((r) => r.key === "mirpur")!.mostlyOneSite).toBe(true);
  });
});

describe("PropertyPriceIndexScreen", () => {
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
    expect(textOf(h1[0])).toContain(en.propertyPriceIndex.headline);
  });

  it("shows one card per area the data supports, with the listing count behind it", () => {
    const tree = render();
    const text = textOf(tree.root);
    const { published } = getAreaPriceIndex();
    expect(published.length).toBeGreaterThan(0);
    for (const row of published) {
      expect(text).toContain(`Based on ${row.listings} listings`);
    }
  });

  it("never claims transaction data, a trend or a year-over-year change", () => {
    const text = textOf(render().root);
    expect(text).not.toMatch(/Verified Transaction|YoY|year-over-year|\+\d+(\.\d+)?%/i);
    expect(text).toContain("asking prices");
  });

  it("sends the reader to the free estimate", () => {
    const tree = render();
    const button = tree.root.findAll(
      (n) => n.props.accessibilityRole === "button" && textOf(n).includes(en.propertyPriceIndex.ctaButton),
    )[0];
    act(() => button.props.onPress());
    expect(mockPush).toHaveBeenCalledWith("/instant-valuation");
  });
});
