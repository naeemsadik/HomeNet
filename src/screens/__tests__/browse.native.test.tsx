import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowseScreen } from "@/screens/BrowseScreen";
import { getProperties } from "@/services/propertyApi";
import { fetchAreas } from "@/services/areaApi";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useLocalSearchParams: jest.fn(() => ({ subtype: "short-let" })),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  usePathname: () => "/rent",
}));
jest.mock("@/services/propertyApi", () => ({
  getProperties: jest.fn(),
  getPropertiesInAreas: jest.fn(),
  getSavedProperties: jest.fn(),
  saveProperty: jest.fn(),
  unsaveProperty: jest.fn(),
}));
jest.mock("@/services/areaApi", () => ({ fetchAreas: jest.fn() }));
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/PropertyCard", () => {
  const { Text } = jest.requireActual("react-native");
  return {
    CARD_HEIGHT: 400,
    PropertyCard: ({ property }: { property: { title: string; listing_type: string } }) => (
      <Text>{`CARD ${property.title} [${property.listing_type}]`}</Text>
    ),
  };
});

const getProps = getProperties as jest.Mock;
const getAreas = fetchAreas as jest.Mock;

const villa = { id: "v1", title: "The Villa", listing_type: "short_let", status: "active", created_at: "2026-10-01T00:00:00Z" };

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

async function mount(): Promise<ReactTestRenderer> {
  // gcTime: Infinity schedules no cache-cleanup timer, which would keep Jest from exiting.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <BrowseScreen mode="rent" />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  mounted.push(tree);
  return tree;
}

const mounted: ReactTestRenderer[] = [];
afterEach(() => {
  for (const tree of mounted.splice(0)) act(() => tree.unmount());
});

beforeEach(() => {
  jest.clearAllMocks();
  getProps.mockResolvedValue({ data: { items: [villa], total: 1, page: 1, limit: 20 } });
  getAreas.mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 100 } });
});

describe("the browse screen on Android, on the Holiday stay tab", () => {
  it("asks the API for holiday stays by their listing type, not for rentals that mention the words", async () => {
    await mount();

    const asked = getProps.mock.calls.map(([filters]) => filters);
    expect(asked.length).toBeGreaterThan(0);
    for (const filters of asked) {
      expect(filters.listing_type).toBe("short_let");
      expect(filters.search).toBeUndefined();
    }
  });

  it("shows the holiday stay it gets back", async () => {
    const text = textOf((await mount()).root);
    expect(text).toContain("CARD The Villa [short_let]");
    expect(text).toContain("1");
  });
});

describe("the Area list when the API returns only part of it", () => {
  const press = (node: ReactTestInstance) => act(() => node.props.onPress());

  it("offers the site's own places instead of a list of two", async () => {
    // What the API did when its cache held a short page: 2 of 41 areas.
    getAreas.mockResolvedValue({
      data: {
        items: [
          { id: "a", name: "Banani", parent_area_id: null, city: "Dhaka", center_lat: 23.79, center_lng: 90.4 },
          { id: "b", name: "Banasree", parent_area_id: null, city: "Dhaka" },
        ],
        total: 41,
        page: 1,
        limit: 2,
      },
    });
    const tree = await mount();

    const box = tree.root.findAll((n) => n.props.accessibilityRole === "button" && typeof n.props.onPress === "function").find((b) => textOf(b).includes("All areas"));
    expect(box).toBeDefined();
    press(box!);

    const rows = tree.root
      .findAll((n) => n.props.accessibilityRole === "menuitem" && typeof n.props.onPress === "function")
      .map((r) => textOf(r).trim());
    expect(rows.length).toBeGreaterThan(20);
    expect(rows).toEqual(expect.arrayContaining(["All areas", "Dhaka", "Gulshan", "Uttara"]));
  });
});
