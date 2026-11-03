import React from "react";
import { Dimensions, Text } from "react-native";
import renderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SellerShell } from "@/features/seller/components/SellerShell";
import { isSellerSectionOn, SELLER_SECTIONS } from "@/lib/features";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  usePathname: () => "/seller",
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("seller sections that are not ready", () => {
  it("are switched off unless the build turns them on", () => {
    expect(SELLER_SECTIONS).toEqual({ insights: false, analytics: false, payments: false });
    for (const key of ["insights", "analytics", "payments"]) expect(isSellerSectionOn(key)).toBe(false);
    for (const key of ["dashboard", "listings", "create", "boost", "profile", "help", "logout"]) {
      expect(isSellerSectionOn(key)).toBe(true);
    }
  });

  it("are left out of the seller menu, while the rest of it stays", () => {
    // Desktop width, so the sidebar is on screen rather than in the drawer.
    jest.spyOn(Dimensions, "get").mockReturnValue({ width: 1280, height: 900, scale: 1, fontScale: 1 });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    let tree!: ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 1280, height: 900 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
            <SellerShell activeNav="dashboard">
              <Text>Body</Text>
            </SellerShell>
          </SafeAreaProvider>
        </QueryClientProvider>,
      );
    });
    const menu = textOf(tree.root);
    for (const shown of ["Dashboard", "Boost Listings", "Help Center"]) expect(menu).toContain(shown);
    for (const hidden of ["AI Insights", "Analytics", "Payments"]) expect(menu).not.toContain(hidden);
    act(() => tree.unmount());
    jest.restoreAllMocks();
  });
});
