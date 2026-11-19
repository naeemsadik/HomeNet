import React from "react";
import { Dimensions } from "react-native";
import renderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MyPropertiesScreen } from "@/features/property/screens/MyPropertiesScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  usePathname: () => "/my-properties",
  useLocalSearchParams: () => ({}),
}));
jest.mock("@/lib/alert", () => ({ ...jest.requireActual("@/lib/alert"), confirmAction: jest.fn(), notify: jest.fn() }));

const mockPublish = jest.fn();
jest.mock("@/features/property/hooks/usePropertyMutations", () => ({
  useArchiveProperty: () => ({ mutateAsync: jest.fn() }),
  useDeleteProperty: () => ({ mutateAsync: jest.fn() }),
  useUnarchiveProperty: () => ({ mutateAsync: jest.fn() }),
  usePublishProperty: () => ({ mutateAsync: mockPublish }),
}));

const listing = (id: string, fields: Record<string, unknown>) => ({
  id,
  title: `Flat ${id}`,
  listing_type: "sale",
  price: 1,
  media: [],
  created_at: "2026-01-01T00:00:00Z",
  ...fields,
});
jest.mock("@/features/property/hooks/useMyProperties", () => ({
  useMyProperties: () => ({
    data: {
      pages: [
        {
          data: {
            items: [
              listing("held", { status: "draft", ready_to_publish: true }),
              listing("review", { status: "pending" }),
              listing("declined", { status: "rejected" }),
            ],
            total: 3,
          },
        },
      ],
    },
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

describe("an edited listing on My Properties", () => {
  it("says what each state means and publishes only the one the owner may publish", async () => {
    jest.spyOn(Dimensions, "get").mockReturnValue({ width: 390, height: 800, scale: 2, fontScale: 1 });
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

    const text = textOf(tree.root);
    expect(text).toContain("Approved, ready to publish");
    expect(text).toContain("In review");
    expect(text).toContain("Not approved");

    const publish = tree.root.findAll((n) => typeof n.props.onPress === "function" && n.props.accessibilityLabel === "Publish");
    expect(publish).toHaveLength(1);
    await act(async () => {
      await publish[0].props.onPress();
    });
    expect(mockPublish).toHaveBeenCalledWith("held");

    act(() => tree.unmount());
    jest.restoreAllMocks();
  });
});
