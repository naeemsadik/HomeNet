import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { AppLink } from "@/components/ui";
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
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: false }));

let mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
jest.mock("@/hooks/useResponsive", () => ({ useResponsive: () => mockResponsive }));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join(" ");
};

const render = () => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Footer />);
  });
  return tree;
};

describe("Student accommodation in the footer (Mess & Seat Share off)", () => {
  it("is not in the desktop footer: there is no page for it yet", () => {
    mockResponsive = { isPhone: false, isTablet: false, width: 1280, containerMaxWidth: 1200 };
    const links = render().root.findAllByType(AppLink);
    expect(links.some((n) => textOf(n).includes("Student accommodation"))).toBe(false);
    expect(links.some((n) => String(n.props.href).includes("subtype=student"))).toBe(false);
  });

  it("is not in the phone footer's Search section either", () => {
    mockResponsive = { isPhone: true, isTablet: false, width: 375, containerMaxWidth: 375 };
    const tree = render();
    const header = tree.root.find((n) => n.props.accessibilityRole === "button" && n.props.accessibilityLabel === "Search");
    act(() => header.props.onPress());
    const links = tree.root.findAllByType(AppLink);
    expect(links.some((n) => textOf(n).includes("Student accommodation"))).toBe(false);
  });
});
