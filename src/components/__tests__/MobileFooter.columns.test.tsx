import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { StyleSheet, View } from "react-native";
import { MobileFooter } from "@/components/MobileFooter";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ push: jest.fn() }),
    router: { push: jest.fn() },
    Link: ({ children, href, style }: any) => React.cloneElement(React.Children.only(children), { href, style }),
  };
});

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join(" ");
};

/**
 * The phone footer's links follow the layout of large property sites: left-aligned rows with a
 * divider between neighbours, three to a row, so the spacing is the same everywhere.
 */
describe("the phone footer's policy links", () => {
  it("sit in left-aligned rows with a divider between neighbours", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<MobileFooter />);
    });
    const byTestId = (root: ReactTestInstance, id: string) => root.findAll((n) => n.type === View && n.props.testID === id);
    const rows = byTestId(tree.root, "footer-legal-row");
    expect(rows.map((row) => textOf(row).replace(/\s+/g, " ").trim())).toEqual([
      "Site map Help Safety and Security",
      "Terms of Use Accessibility Privacy Policy",
      "Delete account Contact us",
    ]);
    expect(rows.map((row) => byTestId(row, "footer-legal-divider").length)).toEqual([3, 3, 2]);
    for (const row of rows) {
      expect(StyleSheet.flatten(row.props.style)?.justifyContent).toBeUndefined();
    }
    act(() => tree.unmount());
  });
});
