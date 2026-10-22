import React from "react";
import { Text as RNText } from "react-native";
import renderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import { getProperties } from "@/services/propertyApi";
import { BrowseScreen } from "@/screens/BrowseScreen";

/** The URL the screen reads. Filters live here and nowhere else. */
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/services/propertyApi", () => ({
  getProperties: jest.fn(async () => ({
    data: { items: [], total: 0, page: 1, limit: 20 },
  })),
}));

// The chrome and the cards are not what these tests are about, and they pull in
// the whole app shell.
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));
jest.mock("@/hooks/useAllAreas", () => ({
  useAllAreas: () => ({ data: { items: [], total: 0, complete: true } }),
}));
jest.mock("@/stores/savedStore", () => ({
  useSavedStore: () => ({
    savedIds: [],
    toggleSaved: jest.fn(),
    isSaved: () => false,
  }),
}));

// React reads this to know that act() is expected in tests.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * All the text under a node, in order. Handles both shapes: rendered JSON
 * nodes keep children at the top level, React elements keep them on props.
 */
function textOf(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  const { children, props } = node as { children?: unknown; props?: { children?: unknown } };
  return [textOf(children), textOf(props?.children)].filter(Boolean).join(" ");
}

/** Torn down after each test, so the modal's debounce timer cannot outlive it. */
let mounted: ReactTestRenderer | null = null;

async function render(element: React.ReactElement): Promise<ReactTestRenderer> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>{element}</QueryClientProvider>
    );
  });
  mounted = tree;
  return tree;
}

/** Every filter object `getProperties` was asked for. */
function feedCalls() {
  return (getProperties as jest.Mock).mock.calls.map(([filters]) => filters);
}

function pressableWithText(tree: ReactTestRenderer, label: string) {
  return tree.root
    .findAll((node) => node.props.accessibilityRole === "button" && typeof node.props.onPress === "function")
    .find((node) => textOf(node.props.children).includes(label));
}

describe("BrowseScreen filters on Android", () => {
  beforeEach(() => {
    mockParams = {};
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      mounted?.unmount();
    });
    mounted = null;
  });

  it("sends a bathroom minimum from the URL to the API", async () => {
    // Bug 1: the hero wrote ?bathrooms= and Browse never read it, so the filter
    // was silently dropped between the two screens.
    mockParams = { bathrooms: "2" };
    await render(<BrowseScreen mode="buy" />);

    expect(feedCalls()).toEqual(
      expect.arrayContaining([expect.objectContaining({ bathrooms: 2 })])
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
    await render(<BrowseScreen mode="buy" />);

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
      ])
    );
  });

  it("opens the filters modal from ?filters=open and writes an applied filter to the URL", async () => {
    // Bug 3: the modal's state used to go into a variable nothing read, so
    // applying a filter changed nothing at all.
    mockParams = { filters: "open" };
    const tree = await render(<BrowseScreen mode="buy" />);

    const lift = pressableWithText(tree, "Lift");
    expect(lift).toBeDefined();
    await act(async () => lift!.props.onPress());

    const apply = pressableWithText(tree, "Show results");
    expect(apply).toBeDefined();
    await act(async () => apply!.props.onPress());

    expect(router.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ amenities: "lift" })
    );
  });

  it("carries an area chosen in the bar straight into the filters modal", async () => {
    // The point of keeping Area in the bar: having chosen it once, the modal
    // opens with it already chosen, so nobody picks the same area twice.
    mockParams = { area_id: "gulshan-dhaka", location: "Gulshan", filters: "open" };
    const tree = await render(<BrowseScreen mode="buy" />);

    const areaFields = tree.root.findAll(
      (node) => node.props.accessibilityLabel === "Location"
    );
    expect(areaFields.length).toBeGreaterThan(0);
    // The native select renders its current choice as plain text.
    // The native select renders its current choice as plain text.
    const shown = areaFields
      .flatMap((field) => field.findAllByType(RNText))
      .map((node) => textOf(node.props.children))
      .join(" ");
    expect(shown).toContain("Gulshan");
  });

  it("filters by the area's id, never by a city name", async () => {
    // The deployed API rejects `city` outright with a 400 ("property city
    // should not exist"), so an area search that sent it came back empty.
    mockParams = { area_id: "gulshan-dhaka", location: "Gulshan" };
    await render(<BrowseScreen mode="buy" />);

    expect(feedCalls()).toEqual(
      expect.arrayContaining([expect.objectContaining({ area_id: "gulshan-dhaka" })])
    );
    for (const call of feedCalls()) {
      expect(call).not.toHaveProperty("city");
    }
  });

  it("sends no city even when an old link carries one", async () => {
    mockParams = { city: "Dhaka" };
    await render(<BrowseScreen mode="buy" />);

    for (const call of feedCalls()) {
      expect(call.city).toBeUndefined();
    }
  });

  it("does not touch the live search until Show results is pressed", async () => {
    // Reset empties the pending form only. Closing the sheet afterwards has to
    // leave the search exactly as it was, so a mis-click costs nothing.
    mockParams = { bathrooms: "2", filters: "open" };
    const tree = await render(<BrowseScreen mode="buy" />);

    const reset = tree.root
      .findAll((n) => n.props.accessibilityRole === "button" && typeof n.props.onPress === "function")
      .find((n) => textOf(n.props.children).trim() === "Reset");
    expect(reset).toBeDefined();
    await act(async () => reset!.props.onPress());

    expect(router.setParams).not.toHaveBeenCalled();
  });

  it("clears a filter out of the URL rather than leaving it behind", async () => {
    // router.setParams merges, so a cleared filter has to be written as empty.
    mockParams = { bathrooms: "2", amenities: "lift" };
    const tree = await render(<BrowseScreen mode="buy" />);

    const reset = pressableWithText(tree, "Reset filters");
    expect(reset).toBeDefined();
    await act(async () => reset!.props.onPress());

    expect(router.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ bathrooms: "", amenities: "" })
    );
  });
});
