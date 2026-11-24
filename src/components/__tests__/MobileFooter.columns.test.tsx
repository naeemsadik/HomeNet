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
 * The policy links used to flow one after another with a divider, so on the second row "Contact us"
 * started wherever "Delete account" happened to end, and did not line up with "Terms of Use" above.
 */
describe("the phone footer's policy links", () => {
  it("sit in two equal columns, so each row lines up", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<MobileFooter />);
    });
    const columns = tree.root.findAll(
      (n) => n.type === View && StyleSheet.flatten(n.props.style)?.width === "50%",
    );
    const labels = columns.map((column) => textOf(column).replace("|", "").trim());
    expect(labels).toEqual(["Privacy Policy", "Terms of Use", "Delete account", "Contact us"]);
    // A "|" after the left link of each row, as on the website footer; none after the right link.
    const hasPipe = columns.map((column) => textOf(column).includes("|"));
    expect(hasPipe).toEqual([true, false, true, false]);
    act(() => tree.unmount());
  });
});
