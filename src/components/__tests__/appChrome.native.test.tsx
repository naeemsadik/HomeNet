import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Dimensions, Text } from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { layout } from "@/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
// The chrome around the page is what these tests are about, not what the modals hold.
jest.mock("@/components/AiFinderModal", () => ({ AiFinderModal: () => null }));
jest.mock("@/features/valuation/components/InstantValuationModal", () => ({ InstantValuationModal: () => null }));
jest.mock("@/features/notification/components/NotificationPreview", () => ({ NotificationPreview: () => null }));
jest.mock("@/features/notification/hooks/useNotifications", () => ({
  useUnreadCount: () => ({ data: { data: { count: 0 } } }),
}));

const STATUS_BAR = 36;
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 800 },
  insets: { top: STATUS_BAR, left: 0, right: 0, bottom: 0 },
};

const mounted: ReactTestRenderer[] = [];

function mount(): ReactTestRenderer {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <SafeAreaProvider initialMetrics={metrics}>
          <AppChrome active="market">
            <Text>Page body</Text>
          </AppChrome>
        </SafeAreaProvider>
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");
const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style as Record<string, unknown>) ?? {});

beforeEach(() => {
  jest.spyOn(Dimensions, "get").mockReturnValue({ width: 390, height: 800, scale: 2, fontScale: 1 });
});

afterEach(() => {
  jest.restoreAllMocks();
  mounted.splice(0).forEach((tree) => act(() => tree.unmount()));
  jest.clearAllMocks();
});

describe("the page chrome on a phone", () => {
  it("starts the page below the navbar and the status bar, not under them", () => {
    const tree = mount();
    const scroll = tree.root.find((n) => typeof n.props.contentContainerStyle !== "undefined" && n.props.showsVerticalScrollIndicator === false);
    expect(flat(scroll.props.contentContainerStyle).paddingTop).toBe(layout.navHeightPhone + STATUS_BAR);
  });

  it("lists the web navbar's links, Holiday Stay included, in the hamburger menu", () => {
    const tree = mount();
    const menuButton = tree.root.find((n) => n.props.accessibilityLabel === "Open navigation menu" && typeof n.props.onPress === "function");
    act(() => menuButton.props.onPress());

    const links = tree.root.findAll((n) => n.props.accessibilityRole === "link" && typeof n.props.onPress === "function");
    const labels = links.map(textOf).map((label) => label.trim());
    for (const label of ["Home", "Buy", "Rent", "Holiday Stay", "Sold", "Insights", "Saved", "Profile"]) {
      expect(labels).toContain(label);
    }

    act(() => links[labels.indexOf("Holiday Stay")].props.onPress());
    expect(router.push).toHaveBeenCalledWith("/rent?subtype=short-let");
  });
});
