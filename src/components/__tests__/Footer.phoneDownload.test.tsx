import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { Footer } from "@/components/Footer";

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

let mockResponsive = { isPhone: true, isTablet: false, width: 375, containerMaxWidth: 375 };
jest.mock("@/hooks/useResponsive", () => ({ useResponsive: () => mockResponsive }));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join(" ");
};

const render = (props: { compact?: boolean } = {}) => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Footer {...props} />);
  });
  return tree;
};

/** The phone website's footer opens with the Google Play badge, as the desktop footer does. */
describe("the phone footer on the website", () => {
  it("shows 'Download the Homenet app' and the Google Play badge above the sections", () => {
    const tree = render();
    const text = textOf(tree.root);
    expect(text).toContain("Download the Homenet app");
    expect(tree.root.findAll((n) => n.props.accessibilityLabel === "Get it on Google Play").length).toBeGreaterThan(0);
    expect(text.indexOf("Download the Homenet app")).toBeLessThan(text.indexOf("Resources"));
    act(() => tree.unmount());
  });

  it("does not add a second <h1>: the heading is a level 3 heading", () => {
    const tree = render();
    const heading = tree.root.find((n) => n.props.accessibilityRole === "header" && textOf(n).includes("Download the Homenet app"));
    expect(heading.props["aria-level"]).toBe(3);
    act(() => tree.unmount());
  });

  it("shows it on the compact phone footer too", () => {
    const tree = render({ compact: true });
    expect(textOf(tree.root)).toContain("Download the Homenet app");
    act(() => tree.unmount());
  });
});
