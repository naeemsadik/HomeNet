import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { Linking } from "react-native";
import { CareersScreen, CAREERS_EMAIL } from "@/screens/CareersScreen";
import { en } from "@/i18n";
import { interpolate } from "@/i18n/useTranslation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

let mockAppChromeProps: Record<string, unknown> = {};
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode; active?: string }) => {
    mockAppChromeProps = props;
    return props.children;
  },
}));

jest.mock("@/lib/alert", () => ({
  notify: jest.fn(),
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("CareersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome without active='home' so bottom navigation does not highlight Home", () => {
    act(() => {
      renderer.create(<CareersScreen />);
    });

    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders the hero heading with accessibilityRole header and aria-level 1", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1,
    );
    expect(headers.length).toBe(1);
    expect(textOf(headers[0])).toContain(en.careers.headline);
  });

  it("renders section headings with accessibilityRole header and aria-level 2", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const sectionHeaders = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 2,
    );
    expect(sectionHeaders.length).toBe(2);
    expect(textOf(sectionHeaders[0])).toContain(en.careers.valuesTitle);
    expect(textOf(sectionHeaders[1])).toContain(en.careers.openPositionsTitle);
  });

  it("renders the 3 value cards (Culture, Autonomy, User Trust)", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.careers.cultureTitle);
    expect(fullText).toContain(en.careers.cultureDesc);
    expect(fullText).toContain(en.careers.autonomyTitle);
    expect(fullText).toContain(en.careers.autonomyDesc);
    expect(fullText).toContain(en.careers.trustTitle);
    expect(fullText).toContain(en.careers.trustDesc);
  });

  it("renders the open positions fallback notice with the interpolated email", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.careers.noOpeningsHeading);
    const expectedNotice = interpolate(en.careers.fallbackNotice, { email: CAREERS_EMAIL });
    expect(fullText).toContain(expectedNotice);
  });

  it("triggers Linking.openURL with the careers mailto link on CTA press", () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true as any);

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const buttons = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "button" && node.props.onPress,
    );
    expect(buttons.length).toBeGreaterThan(0);

    const applyButton = buttons.find((btn) => textOf(btn).includes(en.careers.sendApplication));
    expect(applyButton).toBeDefined();

    act(() => {
      applyButton!.props.onPress();
    });

    expect(openURLSpy).toHaveBeenCalledTimes(1);
    expect(openURLSpy).toHaveBeenCalledWith(
      expect.stringContaining(`mailto:${CAREERS_EMAIL}?subject=`),
    );
  });

  it("displays an accessible inline alert when Linking.openURL fails", async () => {
    jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("No email client installed"));

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CareersScreen />);
    });

    const applyButton = tree!.root
      .findAll((node) => node.props.accessibilityRole === "button" && node.props.onPress)
      .find((btn) => textOf(btn).includes(en.careers.sendApplication));

    expect(applyButton).toBeDefined();

    // Before error: no alert is shown
    expect(
      tree!.root.findAll((node) => node.props.accessibilityRole === "alert"),
    ).toHaveLength(0);

    // Trigger failure
    await act(async () => {
      applyButton!.props.onPress();
    });

    // After failure: accessible inline alert is rendered
    const alertBox = tree!.root.findAll((node) => node.props.accessibilityRole === "alert");
    expect(alertBox.length).toBe(1);

    const expectedFallback = interpolate(en.careers.mailtoFallback, { email: CAREERS_EMAIL });
    expect(textOf(alertBox[0])).toContain(expectedFallback);
  });
});
