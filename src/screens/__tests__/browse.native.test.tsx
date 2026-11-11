import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dimensions } from "react-native";
import { router } from "expo-router";
import { BrowseScreen } from "@/screens/BrowseScreen";
import { getProperties, getPropertiesInAreas } from "@/services/propertyApi";
import { fetchAreas } from "@/services/areaApi";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** The URL the screen reads. Filters live here and nowhere else. */
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useLocalSearchParams: () => mockParams,
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() },
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
// The chrome and the cards are not what these tests are about, and they pull
// in the whole app shell.
let mockActivePage: string | undefined;
let mockFloating: React.ReactNode;
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({
    children,
    active,
    floating,
  }: {
    children: React.ReactNode;
    active?: string;
    floating?: React.ReactNode;
  }) => {
    mockActivePage = active;
    mockFloating = floating;
    return <>{children}</>;
  },
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

const villa = {
  id: "v1",
  title: "The Villa",
  listing_type: "short_let",
  status: "active",
  created_at: "2026-10-01T00:00:00Z",
};

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

/** Torn down after each test, so the modal's debounce timer cannot outlive it. */
const mounted: ReactTestRenderer[] = [];

async function mount(
  mode: "buy" | "rent" | "sold" = "rent",
  onTotalChange?: (total: number) => void,
): Promise<ReactTestRenderer> {
  // gcTime: Infinity schedules no cache-cleanup timer, which would keep Jest from exiting.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <BrowseScreen mode={mode} onTotalChange={onTotalChange} />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  mounted.push(tree);
  return tree;
}

afterEach(() => {
  for (const tree of mounted.splice(0)) act(() => tree.unmount());
  jest.restoreAllMocks();
});

/**
 * The default test window is phone-sized, where the search screen shows the
 * filters modal instead of the desktop filter card and its toolbar.
 */
function withDesktopWindow() {
  jest.spyOn(Dimensions, "get").mockReturnValue({ width: 1280, height: 900, scale: 2, fontScale: 1 });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { searched: "1" };
  getProps.mockResolvedValue({ data: { items: [villa], total: 1, page: 1, limit: 20 } });
  getAreas.mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 100 } });
});

/** Every filter object `getProperties` was asked for. */
function feedCalls() {
  return getProps.mock.calls.map(([filters]) => filters);
}

function pressableWithText(tree: ReactTestRenderer, label: string) {
  return tree.root
    .findAll((node) => node.props.accessibilityRole === "button" && typeof node.props.onPress === "function")
    .find((node) => textOf(node).includes(label));
}

describe("the browse screen on Android, on the Holiday stay tab", () => {
  beforeEach(() => {
    mockParams = { subtype: "short-let", searched: "1" };
  });

  it("asks the API for holiday stays by their listing type, not for rentals that mention the words", async () => {
    await mount();

    const asked = feedCalls();
    expect(asked.length).toBeGreaterThan(0);
    for (const filters of asked) {
      expect(filters.listing_type).toBe("short_let");
      expect(filters.search).toBeUndefined();
    }
  });

  it("highlights Holiday Stay in the navbar, not Rent", async () => {
    await mount("rent");
    expect(mockActivePage).toBe("holiday");
  });

  it("shows the holiday stay it gets back", async () => {
    const text = textOf((await mount()).root);
    expect(text).toContain("CARD The Villa [short_let]");
    expect(text).toContain("1");
  });
});

describe("the browse screen's navbar highlight", () => {
  it("highlights Rent on the plain rent page", async () => {
    await mount("rent");
    expect(mockActivePage).toBe("rent");
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
    withDesktopWindow();
    const tree = await mount();

    const box = pressableWithText(tree, "All areas");
    expect(box).toBeDefined();
    press(box!);

    const rows = tree.root
      .findAll((n) => n.props.accessibilityRole === "menuitem" && typeof n.props.onPress === "function")
      .map((r) => textOf(r).trim());
    expect(rows.length).toBeGreaterThan(20);
    expect(rows).toEqual(expect.arrayContaining(["All areas", "Dhaka", "Gulshan", "Uttara"]));
  });
});

describe("BrowseScreen filters on Android", () => {
  it("sends a bathroom minimum from the URL to the API", async () => {
    // Bug 1: the hero wrote ?bathrooms= and Browse never read it, so the filter
    // was silently dropped between the two screens.
    mockParams = { bathrooms: "2" };
    await mount("buy");

    expect(feedCalls()).toEqual(
      expect.arrayContaining([expect.objectContaining({ bathrooms: 2 })]),
    );
  });

  it("sends the price, bedroom and size filters a shared link carries", async () => {
    mockParams = {
      min_price: "50 lakh",
      max_price: "1.5cr",
      bedrooms: "3",
      min_area: "1000",
      max_area: "2000",
      is_verified: "true",
    };
    await mount("buy");

    expect(feedCalls()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          min_price: 5000000,
          max_price: 15000000,
          bedrooms: 3,
          min_area: 1000,
          max_area: 2000,
          is_verified: true,
          listing_type: "sale",
        }),
      ]),
    );
  });

  it("sends no city param, whatever an old link carried", async () => {
    // The deployed API rejects `city` outright with a 400 ("property city
    // should not exist"), so an area search that sent it came back empty.
    mockParams = { city: "Dhaka" };
    await mount("buy");

    for (const call of feedCalls()) {
      expect(call.city).toBeUndefined();
    }
  });

  it("opens the filters modal from ?filters=open and writes an applied filter to the URL", async () => {
    // Bug 3: the modal's state used to go into a variable nothing read, so
    // applying a filter changed nothing at all.
    mockParams = { filters: "open" };
    const tree = await mount("buy");

    const lift = pressableWithText(tree, "Lift");
    expect(lift).toBeDefined();
    await act(async () => lift!.props.onPress());

    const apply = pressableWithText(tree, "Show results");
    expect(apply).toBeDefined();
    await act(async () => apply!.props.onPress());

    expect(router.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ amenities: "lift" }),
    );
  });

  it("does not touch the live search until Show results is pressed", async () => {
    // Reset empties the pending form only. Closing the sheet afterwards has to
    // leave the search exactly as it was, so a mis-click costs nothing.
    mockParams = { bathrooms: "2", filters: "open" };
    const tree = await mount("buy");

    const reset = tree.root
      .findAll((n) => n.props.accessibilityRole === "button" && typeof n.props.onPress === "function")
      .find((n) => textOf(n).trim() === "Reset");
    expect(reset).toBeDefined();
    await act(async () => reset!.props.onPress());

    expect(router.setParams).not.toHaveBeenCalled();
  });

  it("clears a filter out of the URL rather than leaving it behind", async () => {
    // router.setParams merges, so a cleared filter has to be written as empty.
    mockParams = { bathrooms: "2", amenities: "lift" };
    withDesktopWindow();
    const tree = await mount("buy");

    const reset = pressableWithText(tree, "Reset filters");
    expect(reset).toBeDefined();
    await act(async () => reset!.props.onPress());

    expect(router.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ bathrooms: "", amenities: "" }),
    );
  });
});

describe("the List | Map switcher in the app", () => {
  const mapView = (tree: ReactTestRenderer) =>
    tree.root.findAll((node) => (node.type as unknown) === "RNCWebView");

  it("is offered as on the website: Map shows the listings map, List brings the cards back", async () => {
    const tree = await mount("buy");

    // In the results row, not floating over the cards.
    expect(mockFloating).toBeFalsy();
    expect(mapView(tree)).toHaveLength(0);
    expect(textOf(tree.root)).toContain("CARD The Villa");

    await act(async () => pressableWithText(tree, "Map")!.props.onPress());
    expect(mapView(tree)).toHaveLength(1);
    expect(textOf(tree.root)).not.toContain("CARD The Villa");

    await act(async () => pressableWithText(tree, "List")!.props.onPress());
    expect(mapView(tree)).toHaveLength(0);
    expect(textOf(tree.root)).toContain("CARD The Villa");
  });
});

describe("the filter sheet's result count", () => {
  it("counts the area picked in the sheet before Show results is pressed", async () => {
    // Picking Mohammadpur left the button on "Show 18 results": the count was
    // asked for without the area, which the feed sends as an area id.
    getAreas.mockResolvedValue({
      data: {
        items: [{ id: "mpur", name: "Mohammadpur", parent_area_id: null, city: "Dhaka" }],
        total: 1,
        page: 1,
        limit: 100,
      },
    });
    getProps.mockImplementation(async (filters: { area_id?: string }) => ({
      data: { items: [villa], total: filters.area_id === "mpur" ? 2 : 18, page: 1, limit: 20 },
    }));
    // An area and its sub-areas are asked for by id, the way the feed does it.
    (getPropertiesInAreas as jest.Mock).mockImplementation(async (_filters: unknown, ids: string[]) => ({
      items: [villa, villa],
      total: ids.includes("mpur") ? 2 : 0,
    }));
    mockParams = { filters: "open", searched: "1" };
    const tree = await mount("rent");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });
    expect(pressableWithText(tree, "Show 18 results")).toBeDefined();

    const box = pressableWithText(tree, "All areas");
    expect(box).toBeDefined();
    await act(async () => box!.props.onPress());
    const row = tree.root
      .findAll((n) => n.props.accessibilityRole === "menuitem" && typeof n.props.onPress === "function")
      .find((r) => textOf(r).trim() === "Mohammadpur");
    expect(row).toBeDefined();
    await act(async () => row!.props.onPress());

    // The sheet waits 400 ms after the last change before it asks.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(pressableWithText(tree, "Show 2 results")).toBeDefined();
    expect(router.setParams).not.toHaveBeenCalled();
  });
});

describe("the search card before a search", () => {
  it("opens on the search card and asks the API for nothing until Search is pressed", async () => {
    mockParams = {};
    withDesktopWindow();
    const tree = await mount("buy");
    expect(pressableWithText(tree, "Search for Properties")).toBeDefined();
    expect(textOf(tree.root)).not.toMatch(/propert(y|ies) for sale in/);
    expect(feedCalls()).toHaveLength(0);

    await act(async () => pressableWithText(tree, "Search for Properties")!.props.onPress());
    expect(router.setParams).toHaveBeenCalledWith(expect.objectContaining({ searched: "1" }));
  });

  it("treats a filter carried by the link as a search already", async () => {
    mockParams = { bathrooms: "2" };
    withDesktopWindow();
    const tree = await mount("buy");
    expect(textOf(tree.root)).toMatch(/propert(y|ies) for sale in/);
    expect(feedCalls().length).toBeGreaterThan(0);
  });
});

describe("the Rightmove-style results layout", () => {
  const mapView = (tree: ReactTestRenderer) =>
    tree.root.findAll((node) => (node.type as unknown) === "RNCWebView");

  it("swaps the desktop list for a full map from Map view, and back from List view", async () => {
    withDesktopWindow();
    getProps.mockResolvedValue({
      data: { items: [{ ...villa, location_lat: 23.79, location_lng: 90.41 }], total: 1, page: 1, limit: 20 },
    });
    const tree = await mount("buy");

    // The sidebar's mini map is the only map while the list shows.
    const mapsWithList = mapView(tree).length;
    // Wide screens use the wide result card, with its owner contact row.
    expect(textOf(tree.root)).toContain("Direct from owner");

    await act(async () => pressableWithText(tree, "Map view")!.props.onPress());
    expect(textOf(tree.root)).not.toContain("Direct from owner");
    expect(mapView(tree).length).toBeGreaterThanOrEqual(1);
    expect(textOf(tree.root)).toContain("Showing 1 of 1 properties");

    await act(async () => pressableWithText(tree, "List view")!.props.onPress());
    expect(textOf(tree.root)).toContain("Direct from owner");
    expect(mapView(tree)).toHaveLength(mapsWithList);
  });

  it("puts the listings that have a pin in the phone map's card row", async () => {
    getProps.mockResolvedValue({
      data: {
        items: [
          { ...villa, location_lat: 23.79, location_lng: 90.41, price: 5000000, price_currency: "BDT" },
          { ...villa, id: "v2", title: "No Pin Flat" },
        ],
        total: 2,
        page: 1,
        limit: 20,
      },
    });
    const tree = await mount("buy");

    await act(async () => pressableWithText(tree, "Map")!.props.onPress());
    // The row only renders once it has been measured.
    const row = tree.root.findAll((n) => typeof n.props.onLayout === "function" && n.props.style?.position === "absolute");
    for (const node of row) {
      await act(async () => node.props.onLayout({ nativeEvent: { layout: { width: 360, height: 130 } } }));
    }

    const links = tree.root
      .findAll((n) => n.props.accessibilityRole === "link" && typeof n.props.onPress === "function")
      .map((n) => n.props.accessibilityLabel);
    expect(links).toContain("Open The Villa");
    expect(links).not.toContain("Open No Pin Flat");
  });
});

describe("the result count the page uses to keep empty pages out of Google", () => {
  it("reports zero when a search really finds nothing", async () => {
    mockParams = { searched: "1" };
    getProps.mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 20 } });
    const onTotalChange = jest.fn();
    await mount("buy", onTotalChange);
    expect(onTotalChange).toHaveBeenLastCalledWith(0);
  });

  it("reports nothing when the listings could not load, so an outage never marks the page noindex", async () => {
    mockParams = { searched: "1" };
    getProps.mockRejectedValue(new Error("network down"));
    const onTotalChange = jest.fn();
    await mount("buy", onTotalChange);
    expect(onTotalChange).not.toHaveBeenCalled();
  });

  it("reports nothing before a search, while the desktop page shows the search card", async () => {
    mockParams = {};
    withDesktopWindow();
    const onTotalChange = jest.fn();
    await mount("buy", onTotalChange);
    expect(feedCalls()).toHaveLength(0);
    expect(onTotalChange).not.toHaveBeenCalled();
  });
});
