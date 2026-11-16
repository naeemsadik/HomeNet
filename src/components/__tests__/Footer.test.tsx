import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { StyleSheet } from "react-native";
import { AppLink } from "@/components/ui";
import { Footer, RESOURCE_LINKS } from "@/components/Footer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ push: (...args: any[]) => mockPush(...args) }),
    router: { push: (...args: any[]) => mockPush(...args) },
    Link: ({ children, href, style }: any) => {
      return React.cloneElement(React.Children.only(children), { href, style });
    },
  };
});

let mockResponsive = {
  isPhone: false,
  isTablet: false,
  width: 1280,
  containerMaxWidth: 1200,
};

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || [])
    .map((child) => textOf(child as ReactTestInstance))
    .join(" ");
};

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponsive = {
      isPhone: false,
      isTablet: false,
      width: 1280,
      containerMaxWidth: 1200,
    };
  });

  it("renders desktop resources links and does not render Landlord Guides or Mortgage Calculator", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Footer />);
    });

    const fullText = textOf(tree!.root);

    // Active resources links should be present
    expect(fullText).toContain("Stamp Duty & Tax Guide");
    expect(fullText).toContain("Property Price Index");
    expect(fullText).toContain("Property Valuation Guide");
    expect(fullText).toContain("Property News & Trends");
    expect(fullText).toContain("Buyer Guides");
    expect(fullText).toContain("Seller Guides");
    expect(fullText).toContain("Renter Guides");

    // Removed or stale links must NOT be present
    expect(fullText).not.toContain("Landlord Guides");
    expect(fullText).not.toContain("Mortgage Calculator");
    expect(fullText).not.toContain("Insights");
  });

  it("renders mobile footer accordion with all 7 resource links and 44px min touch target", () => {
    mockResponsive = {
      isPhone: true,
      isTablet: false,
      width: 375,
      containerMaxWidth: 375,
    };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Footer />);
    });

    // Find the "Resources" accordion header
    const resourcesHeader = tree!.root.find(
      (node) =>
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityLabel === "Resources"
    );
    expect(resourcesHeader).toBeTruthy();
    // The web only reads aria-*, so the footer states expanded that way.
    expect(resourcesHeader.props["aria-expanded"]).toBe(false);

    // Open the accordion
    act(() => {
      resourcesHeader.props.onPress();
    });

    // Find all resource AppLink components in the mobile footer
    const resourceLinks = tree!.root.findAllByType(AppLink).filter(
      (node) =>
        typeof node.props.href === "string" &&
        node.props.href.startsWith("/resources/")
    );

    expect(resourceLinks).toHaveLength(7);

    const renderedHrefs = resourceLinks.map((node) => node.props.href);
    for (const link of RESOURCE_LINKS) {
      expect(renderedHrefs).toContain(link.href);
    }

    // Verify touch target: each link row must satisfy minHeight >= 44
    for (const linkNode of resourceLinks) {
      const flattenedStyle = StyleSheet.flatten(linkNode.props.style) as { minHeight?: number };
      expect(flattenedStyle?.minHeight).toBeGreaterThanOrEqual(44);
    }

    // Pressing a link closes the accordion (onToggle)
    act(() => {
      resourceLinks[0].props.onPress();
    });

    const closedHeader = tree!.root.find(
      (node) =>
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityLabel === "Resources"
    );
    expect(closedHeader.props["aria-expanded"]).toBe(false);
  });
});

