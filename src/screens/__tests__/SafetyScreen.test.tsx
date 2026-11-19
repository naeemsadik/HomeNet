import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { SafetyScreen } from "@/screens/SafetyScreen";
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

describe("SafetyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<SafetyScreen />);
    });
    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one semantic h1 heading", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SafetyScreen />);
    });

    const headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1
    );
    expect(headers).toHaveLength(1);
    expect(textOf(headers[0])).toContain(en.safety.title);
  });

  it("renders all safety pillars and seeker checklist items", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SafetyScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.safety.pillar1Title);
    expect(fullText).toContain(en.safety.pillar2Title);
    expect(fullText).toContain(en.safety.pillar3Title);
    expect(fullText).toContain(en.safety.pillar4Title);
    expect(fullText).toContain(en.safety.check1);
    expect(fullText).toContain(en.safety.check2);
  });
});
