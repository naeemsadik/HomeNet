import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Dimensions, Text } from "react-native";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { layout } from "@/theme";
import { useAuthStore } from "@/stores/authStore";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
// The chrome around the page is what these tests are about, not what the modals hold.
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

function mount(initialMetrics = metrics): ReactTestRenderer {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
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
  it("keeps the status bar and the navigation bar one colour behind the open drawer", () => {
    const NAV_BAR = 48;
    const tree = mount({ ...metrics, insets: { ...metrics.insets, bottom: NAV_BAR } });
    const menuButton = tree.root.find((n) => n.props.accessibilityLabel === "Open navigation menu" && typeof n.props.onPress === "function");
    act(() => menuButton.props.onPress());

    // The scrim stops at both system bars instead of greying the half beside the drawer.
    const scrim = tree.root.find(
      (n) => n.props.accessibilityLabel === "Close navigation" && typeof n.props.onPress === "function" && flat(n.props.style).position === "absolute",
    );
    expect(flat(scrim.props.style)).toMatchObject({ top: STATUS_BAR, bottom: NAV_BAR });

    // And a full-width strip of the drawer's own colour sits under each bar.
    const strips = tree.root.findAll(
      (n) => n.props.pointerEvents === "none" && [STATUS_BAR, NAV_BAR].includes(flat(n.props.style).height as number) && flat(n.props.style).left === 0 && flat(n.props.style).right === 0,
    );
    const edges = strips.map((strip) => ("top" in flat(strip.props.style) ? "top" : "bottom")).sort();
    expect(edges).toEqual(expect.arrayContaining(["bottom", "top"]));
  });

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
    for (const label of ["Buy", "Rent", "Holiday Stay", "Insights", "Valuation", "Guides"]) {
      expect(labels).toContain(label);
    }

    act(() => links[labels.indexOf("Holiday Stay")].props.onPress());
    expect(router.push).toHaveBeenCalledWith("/rent?subtype=short-let");
  });
});

describe("the account menu on a wide screen", () => {
  afterEach(() => useAuthStore.setState({ user: null, hydrated: false }));

  it.each([
    ["My listings", "/my-properties"],
    ["Seller dashboard", "/seller"],
  ])("takes an owner to %s", (label, href) => {
    jest.spyOn(Dimensions, "get").mockReturnValue({ width: 1280, height: 900, scale: 2, fontScale: 1 });
    useAuthStore.setState({ user: { id: "u1", full_name: "Test Person", email: "t@example.test", avatar_url: null, email_verified: true }, hydrated: true });
    const tree = mount();
    const press = (name: string) =>
      act(() => tree.root.find((n) => n.props.accessibilityLabel === name && typeof n.props.onPress === "function").props.onPress());

    press("Open user menu");
    press(label);

    expect(router.push).toHaveBeenCalledWith(href);
  });
});
