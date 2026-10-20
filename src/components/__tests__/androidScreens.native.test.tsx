import React from "react";
import renderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { router } from "expo-router";
import { AuthCard } from "@/components/AuthCard";
import { Footer } from "@/components/Footer";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// React reads this to know that act() is expected in tests.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** All the text on screen, in order. */
function textOf(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  const { children } = node as { children?: unknown };
  return textOf(children);
}

function render(element: React.ReactElement): ReactTestRenderer {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
}

describe("the footer inside the Android app", () => {
  const text = textOf(render(<Footer />).toJSON());

  it("has what a store reviewer and a user need: policies, deletion and a way to write to us", () => {
    expect(text).toContain("Privacy Policy");
    expect(text).toContain("Terms of Use");
    expect(text).toContain("Delete account");
    expect(text).toContain("Contact us");
  });

  it("does not point back at the website or the store it was installed from", () => {
    expect(text).not.toMatch(/google play/i);
    expect(text).not.toMatch(/get it on/i);
    expect(text).not.toMatch(/download the homenet app/i);
    expect(text).not.toMatch(/investor|careers|press centre/i);
  });
});

describe("the sign-up form on Android", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hides the Google and Facebook buttons that only say 'coming soon'", () => {
    for (const mode of ["signin", "signup"] as const) {
      const text = textOf(render(<AuthCard initialMode={mode} />).toJSON());
      expect(text).not.toMatch(/\bGoogle\b/);
      expect(text).not.toMatch(/\bFacebook\b/);
      expect(text).not.toMatch(/or continue with email/i);
    }
  });

  it("puts the terms and privacy policy in front of someone creating an account", () => {
    const text = textOf(render(<AuthCard initialMode="signup" />).toJSON());
    expect(text).toMatch(/By creating an account you agree to our\s+Terms of Use\s+and\s+Privacy Policy/);
  });

  it("does not show that line to someone signing in", () => {
    expect(textOf(render(<AuthCard initialMode="signin" />).toJSON())).not.toMatch(/By creating an account/);
  });

  it("opens the page, and closes the sign-up modal first so the page is seen", () => {
    const onClose = jest.fn();
    const tree = render(<AuthCard initialMode="signup" onClose={onClose} showClose isModal />);
    const links = tree.root.findAll((n) => n.props.accessibilityRole === "link" && typeof n.props.onPress === "function");
    const terms = links.find((n) => textOf(n.props.children) === "Terms of Use")!;
    const privacy = links.find((n) => textOf(n.props.children) === "Privacy Policy")!;

    act(() => terms.props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenLastCalledWith("/terms");

    act(() => privacy.props.onPress());
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(router.push).toHaveBeenLastCalledWith("/privacy");
  });
});
