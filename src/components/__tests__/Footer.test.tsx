import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { Footer } from "@/components/Footer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  Link: (props: { children: React.ReactNode; href: string }) => props.children,
}));

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isPhone: false,
    isTablet: false,
    containerMaxWidth: 1200,
  }),
}));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || [])
    .map((child) => textOf(child as ReactTestInstance))
    .join(" ");
};

describe("Footer", () => {
  it("renders the resources links and does not render Landlord Guides or Mortgage Calculator", () => {
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

    // Removed links must NOT be present
    expect(fullText).not.toContain("Landlord Guides");
    expect(fullText).not.toContain("Mortgage Calculator");
  });
});

