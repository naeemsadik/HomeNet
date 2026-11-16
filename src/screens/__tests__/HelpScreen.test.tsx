import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { HelpScreen } from "@/screens/HelpScreen";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

let mockAppChromeProps: Record<string, unknown> = {};
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode; active?: string }) => {
    mockAppChromeProps = props;
    return props.children;
  },
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("HelpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<HelpScreen />);
    });
    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one semantic h1 heading", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<HelpScreen />);
    });

    const headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1
    );
    expect(headers).toHaveLength(1);
    expect(textOf(headers[0])).toContain(en.helpCenter.title);
  });

  it("renders FAQ categories and toggles accordions on press", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<HelpScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.helpCenter.cat1Title);
    expect(fullText).toContain(en.helpCenter.cat2Title);
    expect(fullText).toContain(en.helpCenter.cat3Title);

    const faqButtons = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "button" && typeof node.props["aria-expanded"] === "boolean"
    );
    expect(faqButtons.length).toBeGreaterThan(0);
  });
});
