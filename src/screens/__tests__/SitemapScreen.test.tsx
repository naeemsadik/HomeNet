import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { SitemapScreen } from "@/screens/SitemapScreen";
import { AppLink } from "@/components/ui";
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

describe("SitemapScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
  });

  it("renders AppChrome with active=undefined so no bottom tab is falsely highlighted", () => {
    act(() => {
      renderer.create(<SitemapScreen />);
    });
    expect(mockAppChromeProps.active).toBeUndefined();
  });

  it("renders exactly one semantic h1 heading", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SitemapScreen />);
    });

    const headers = tree!.root.findAll(
      (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1
    );
    expect(headers).toHaveLength(1);
    expect(textOf(headers[0])).toContain(en.sitemap.title);
  });

  it("renders all key sections and canonical links", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<SitemapScreen />);
    });

    const fullText = textOf(tree!.root);
    expect(fullText).toContain(en.sitemap.buySection);
    expect(fullText).toContain(en.sitemap.rentSection);
    expect(fullText).toContain(en.sitemap.resourcesSection);
    expect(fullText).toContain(en.sitemap.legalSection);
    expect(fullText).toContain(en.sitemap.companySection);

    const appLinks = tree!.root.findAllByType(AppLink);
    const hrefs = appLinks.map((node) => node.props.href);

    expect(hrefs).toContain("/buy");
    expect(hrefs).toContain("/rent");
    expect(hrefs).toContain("/sold");
    expect(hrefs).toContain("/resources/stamp-duty-tax-guide");
    expect(hrefs).toContain("/guides");
    expect(hrefs).toContain("/contact");
    expect(hrefs).toContain("/about");
  });
});
