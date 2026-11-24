import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { Footer } from "@/components/Footer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() }, Link: ({ children }: any) => children }));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join(" ");
};

/** Inside the app the app is already installed, so its footer carries no download badge. */
describe("the footer in the Android app", () => {
  it("has no Google Play badge", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Footer />);
    });
    expect(textOf(tree.root)).not.toContain("Download the Homenet app");
    expect(tree.root.findAll((n) => n.props.accessibilityLabel === "Get it on Google Play")).toHaveLength(0);
    act(() => tree.unmount());
  });
});
