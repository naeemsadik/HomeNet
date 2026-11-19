import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { TechBlogScreen } from "@/screens/TechBlogScreen";
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

describe("TechBlogScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<TechBlogScreen />);
    });
    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one semantic h1 heading", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<TechBlogScreen />);
    });

    const headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1
    );
    expect(headers).toHaveLength(1);
    expect(textOf(headers[0])).toContain(en.techBlog.title);
  });

  it("renders AVM model, anti-fraud pipeline, trilingual search, and careers CTA", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<TechBlogScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.techBlog.avmHeading);
    expect(fullText).toContain(en.techBlog.antiFraudHeading);
    expect(fullText).toContain(en.techBlog.nlpHeading);
    expect(fullText).toContain(en.techBlog.careersHeading);
    expect(fullText).toContain(en.techBlog.careersLinkText);
  });
});
