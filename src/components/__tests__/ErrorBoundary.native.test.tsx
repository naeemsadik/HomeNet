import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({ ...jest.requireActual("expo-router"), router: { replace: jest.fn() } }));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

function Boom(): React.ReactElement {
  throw new TypeError("Cannot read property 'map' of undefined");
}

describe("the error screen in the Android app", () => {
  let consoleSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it("shows what failed, so a crash can be reported from the phone", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });
    const shown = textOf(tree.root);
    expect(shown).toContain("Something went wrong");
    expect(shown).toContain("TypeError: Cannot read property 'map' of undefined");
  });

  it("writes the error to the log", () => {
    act(() => {
      renderer.create(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });
    const logged = consoleSpy.mock.calls.map((call) => (call as unknown[]).map((arg) => JSON.stringify(arg) ?? String(arg)).join(" ")).join("\n");
    expect(logged).toContain("Cannot read property 'map' of undefined");
  });
});
