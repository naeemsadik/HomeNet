import React from "react";
import { Dimensions, Text } from "react-native";
import renderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "@/screens/HomeScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The page chrome and the sections below the hero are not what this is about.
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ bleed, children }: { bleed?: React.ReactNode; children: React.ReactNode }) => (
    <>
      {bleed}
      {children}
    </>
  ),
}));
jest.mock("@/components/MobileHeroSearchCard", () => ({ MobileHeroSearchCard: () => null }));
jest.mock("@/components/MobileHomeSections", () => ({ MobileHomeSections: () => null }));
jest.mock("@/services/propertyApi", () => ({
  getProperties: jest.fn(() => new Promise(() => undefined)),
}));

const STATUS_BAR = 36;
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: STATUS_BAR, left: 0, right: 0, bottom: 0 },
};

const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style as Record<string, unknown>) ?? {});

let tree: ReactTestRenderer;

beforeEach(() => {
  jest.spyOn(Dimensions, "get").mockReturnValue({ width: 360, height: 800, scale: 2, fontScale: 1 });
});

afterEach(() => {
  act(() => tree.unmount());
  jest.restoreAllMocks();
});

describe("the phone home hero in the Android app", () => {
  it("is tall enough for the status bar, so the headline is not clipped under the search card", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    act(() => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <SafeAreaProvider initialMetrics={metrics}>
            <HomeScreen />
          </SafeAreaProvider>
        </QueryClientProvider>,
      );
    });

    const headline = tree.root.find(
      (n) => n.type === Text && n.props.accessibilityRole === "header",
    );

    // Every box around the headline must be at least as tall as the photo,
    // or the outer one cuts off the bottom, where the headline is.
    const heights: number[] = [];
    let node: ReactTestInstance | null = headline.parent;
    while (node) {
      const height = flat(node.props.style).height;
      if (typeof height === "number") heights.push(height);
      node = node.parent;
    }
    expect(heights.length).toBeGreaterThan(0);
    for (const height of heights) expect(height).toBe(236 + STATUS_BAR);
  });
});
