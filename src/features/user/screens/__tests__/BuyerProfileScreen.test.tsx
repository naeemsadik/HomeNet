import React from "react";
import renderer, { act } from "react-test-renderer";
import { AppLink } from "@/components/ui";
import { BuyerProfileScreen } from "@/features/user/screens/BuyerProfileScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => false },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/components/AppChrome", () => ({ AppChrome: ({ children }: { children: React.ReactNode }) => children }));
// The form is shared with the seller profile and has its own tests; only its slot matters here.
jest.mock("@/components/accountProfile/AccountProfileForm", () => ({
  AccountProfileForm: ({ children }: { children: React.ReactNode }) => children,
  ProfileBadge: () => null,
  profileStyles: {},
}));

describe("the buyer profile", () => {
  it("leads an owner to their listings and the seller dashboard", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<BuyerProfileScreen />);
    });

    const hrefs = tree.root.findAllByType(AppLink).map((link) => link.props.href);
    expect(hrefs).toEqual(["/my-properties", "/seller"]);
  });
});
