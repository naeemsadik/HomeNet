import React from "react";
import { Dimensions } from "react-native";
import renderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MyPropertiesScreen } from "@/features/property/screens/MyPropertiesScreen";
import { confirmAction } from "@/lib/alert";
import { openExternalUrl } from "@/lib/safeUrl";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  usePathname: () => "/my-properties",
  useLocalSearchParams: () => ({}),
}));
jest.mock("@/lib/alert", () => ({ ...jest.requireActual("@/lib/alert"), confirmAction: jest.fn(), notify: jest.fn() }));
jest.mock("@/lib/safeUrl", () => ({ ...jest.requireActual("@/lib/safeUrl"), openExternalUrl: jest.fn() }));

const mockUnarchive = jest.fn();
jest.mock("@/features/property/hooks/usePropertyMutations", () => ({
  useArchiveProperty: () => ({ mutateAsync: jest.fn() }),
  useDeleteProperty: () => ({ mutateAsync: jest.fn() }),
  useUnarchiveProperty: () => ({ mutateAsync: mockUnarchive }),
}));
jest.mock("@/features/property/hooks/useMyProperties", () => ({
  useMyProperties: () => ({
    data: { pages: [{ data: { items: [{ id: "p9", title: "Flat in Banani", status: "archived", listing_type: "sale", price: 1, media: [], created_at: "2026-01-01T00:00:00Z" }], total: 1 } }] },
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("an archived listing on My Properties, while owners cannot restore it", () => {
  it("offers Ask to restore, which emails support instead of calling a restore that changes nothing", async () => {
    jest.spyOn(Dimensions, "get").mockReturnValue({ width: 390, height: 800, scale: 2, fontScale: 1 });
    (confirmAction as jest.Mock).mockResolvedValue(true);
    let tree!: ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })}>
          <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
            <MyPropertiesScreen />
          </SafeAreaProvider>
        </QueryClientProvider>,
      );
    });

    expect(textOf(tree.root)).not.toMatch(/\bUnarchive\b/);
    const ask = tree.root.find((n) => typeof n.props.onPress === "function" && textOf(n).includes("Ask to restore"));
    await act(async () => {
      await ask.props.onPress();
    });

    expect(mockUnarchive).not.toHaveBeenCalled();
    expect(openExternalUrl).toHaveBeenCalledWith(expect.stringMatching(/^mailto:.+\?subject=.+&body=.*p9/));
    act(() => tree.unmount());
    jest.restoreAllMocks();
  });
});
