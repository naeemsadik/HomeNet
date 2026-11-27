import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { StyleSheet } from "react-native";
import { AppLink } from "@/components/ui";
import {
  Footer,
  RESOURCE_LINKS,
  SEARCH_LINKS,
  HOMENET_LINKS,
  PROFESSIONAL_LINKS,
  LEGAL_LINKS,
} from "@/components/Footer";

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
  useWindowSize: () => mockResponsive,
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

  it("verifies zero links point to /about except About HomeNet, and no duplicate hrefs exist per section", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Footer />);
    });

    const allLinks = tree!.root.findAllByType(AppLink);
    const aboutLinks = allLinks.filter((node) => node.props.href === "/about");

    // Only exactly ONE link in the whole footer points to /about ("About HomeNet")
    expect(aboutLinks).toHaveLength(1);
    expect(textOf(aboutLinks[0])).toContain("About HomeNet");

    // Dedicated routes are used instead of /about redirects
    const hrefs = allLinks.map((node) => node.props.href);
    expect(hrefs).toContain("/contact");
    expect(hrefs).toContain("/help");
    expect(hrefs).toContain("/safety");
    expect(hrefs).toContain("/accessibility");
    expect(hrefs).toContain("/sitemap");
    expect(hrefs).toContain("/press");
    expect(hrefs).toContain("/investors");
    expect(hrefs).toContain("/tech-blog");

    // All 7 professional links render on desktop
    expect(hrefs).toContain("/professionals/boosting");
    expect(hrefs).toContain("/professionals/priority-alerts");
    expect(hrefs).toContain("/professionals/analytics");
    expect(hrefs).toContain("/professionals/verified-agency");
    expect(hrefs).toContain("/professionals/whatsapp-inquiries");
    expect(hrefs).toContain("/professionals/account-support");
    expect(hrefs).toContain("/professionals/advertise");

    // Corporate destinations have dedicated links
    const fullText = textOf(tree!.root);
    expect(fullText).toContain("Press centre");
    expect(fullText).toContain("Investor relations");
    expect(fullText).toContain("Tech blog & AI models");
    expect(fullText).toContain("Property Boosting");
    expect(fullText).toContain("Priority Notice & Alerts");
    expect(fullText).toContain("Listing Analytics");
    expect(fullText).toContain("Verified Agency Badge");
    expect(fullText).toContain("Direct WhatsApp Inquiries");
    expect(fullText).toContain("Dedicated Account Support");
    expect(fullText).toContain("Advertise on Homenet");

    // "Holiday Stay" is not rendered as a top-level category in Search links
    const searchHrefs = SEARCH_LINKS.map((l) => l.href);
    expect(searchHrefs).not.toContain("/rent?subtype=short-let");

    // Verify every single link across HOMENET_LINKS and PROFESSIONAL_LINKS has a strictly unique href
    const checkNoDuplicates = (section: readonly { href: string }[]) => {
      const set = new Set(section.map((item) => item.href));
      expect(set.size).toBe(section.length);
    };

    checkNoDuplicates(SEARCH_LINKS);
    checkNoDuplicates(HOMENET_LINKS);
    checkNoDuplicates(PROFESSIONAL_LINKS);
    checkNoDuplicates(LEGAL_LINKS);

    // Verify zero catch-all redirects to /about or /seller in professional links
    expect(PROFESSIONAL_LINKS).toHaveLength(7);
    expect(PROFESSIONAL_LINKS.some((l) => l.href === "/about" || l.href === "/seller")).toBe(false);
    expect(HOMENET_LINKS.filter((l) => l.href === "/about")).toHaveLength(1);
    expect(HOMENET_LINKS.some((l) => l.href === "/seller")).toBe(false);
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

  it("renders mobile footer accordion with all 3 corporate links in Homenet and all 7 unique professional links in Professional", () => {
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

    // 1. Open Homenet accordion
    const homenetHeader = tree!.root.find(
      (node) =>
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityLabel === "Homenet"
    );
    expect(homenetHeader).toBeTruthy();
    expect(homenetHeader.props["aria-expanded"]).toBe(false);

    act(() => {
      homenetHeader.props.onPress();
    });

    const homenetLinks = tree!.root.findAllByType(AppLink).filter((node) => {
      const href = node.props.href;
      return (
        href === "/about" ||
        href === "/careers" ||
        href === "/press" ||
        href === "/investors" ||
        href === "/tech-blog"
      );
    });

    const homenetHrefs = homenetLinks.map((node) => node.props.href);
    expect(homenetHrefs).toContain("/press");
    expect(homenetHrefs).toContain("/investors");
    expect(homenetHrefs).toContain("/tech-blog");
    expect(homenetHrefs).toContain("/about");
    expect(homenetHrefs).toContain("/careers");
    expect(new Set(homenetHrefs).size).toBe(homenetHrefs.length);

    // Verify touch target for Homenet links
    for (const linkNode of homenetLinks) {
      const flattenedStyle = StyleSheet.flatten(linkNode.props.style) as { minHeight?: number };
      expect(flattenedStyle?.minHeight).toBeGreaterThanOrEqual(44);
    }

    // 2. Open Professional accordion
    const professionalHeader = tree!.root.find(
      (node) =>
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityLabel === "Professional"
    );
    expect(professionalHeader).toBeTruthy();

    act(() => {
      professionalHeader.props.onPress();
    });

    const professionalLinks = tree!.root.findAllByType(AppLink).filter(
      (node) =>
        typeof node.props.href === "string" &&
        node.props.href.startsWith("/professionals/")
    );

    expect(professionalLinks).toHaveLength(7);
    const profHrefs = professionalLinks.map((node) => node.props.href);
    expect(profHrefs).toContain("/professionals/boosting");
    expect(profHrefs).toContain("/professionals/priority-alerts");
    expect(profHrefs).toContain("/professionals/analytics");
    expect(profHrefs).toContain("/professionals/verified-agency");
    expect(profHrefs).toContain("/professionals/whatsapp-inquiries");
    expect(profHrefs).toContain("/professionals/account-support");
    expect(profHrefs).toContain("/professionals/advertise");

    // Assert strictly unique hrefs and zero catch-all redirects to /about or /seller
    expect(new Set(profHrefs).size).toBe(7);
    expect(profHrefs.some((h) => h === "/seller" || h === "/about")).toBe(false);

    // Verify touch target for Professional links
    for (const linkNode of professionalLinks) {
      const flattenedStyle = StyleSheet.flatten(linkNode.props.style) as { minHeight?: number };
      expect(flattenedStyle?.minHeight).toBeGreaterThanOrEqual(44);
    }
  });
});

