import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dimensions } from "react-native";
import { router } from "expo-router";
import { BrowseScreen } from "@/screens/BrowseScreen";
import { getProperties } from "@/services/propertyApi";
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

async function mount(mode: "buy" | "rent" | "sold" = "rent"): Promise<ReactTestRenderer> {
  // gcTime: Infinity schedules no cache-cleanup timer, which would keep Jest from exiting.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <BrowseScreen mode={mode} />
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
  mockParams = {};
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
    mockParams = { subtype: "short-let" };
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
  it("is pinned by the chrome above the tabs, not placed at the end of the results", async () => {
    const tree = await mount("buy");

    // Inside the scrolling page it sat at the bottom of the results, over the
    // last card's Email and Call buttons.
    expect(mockFloating).toBeTruthy();
    expect(pressableWithText(tree, "List")).toBeUndefined();

    let floating!: ReactTestRenderer;
    act(() => {
      floating = renderer.create(<>{mockFloating}</>);
    });
    const text = textOf(floating.root);
    expect(text).toContain("List");
    expect(text).toContain("Map");
    act(() => floating.unmount());
  });
});
