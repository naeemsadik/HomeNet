import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { Image, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileNav } from "@/components/AppChrome";
import { initialsOf } from "@/components/UserAvatar";
import { useAuthStore } from "@/stores/authStore";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
jest.mock("@/components/AiFinderModal", () => ({ AiFinderModal: () => null }));
jest.mock("@/features/valuation/components/InstantValuationModal", () => ({ InstantValuationModal: () => null }));
jest.mock("@/features/notification/components/NotificationPreview", () => ({ NotificationPreview: () => null }));
jest.mock("@/features/notification/hooks/useNotifications", () => ({
  useUnreadCount: () => ({ data: { data: { count: 0 } } }),
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const mounted: ReactTestRenderer[] = [];

function mount(active: React.ComponentProps<typeof MobileNav>["active"]): ReactTestRenderer {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <SafeAreaProvider initialMetrics={metrics}>
        <MobileNav active={active} />
      </SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

const tab = (tree: ReactTestRenderer, label: string): ReactTestInstance =>
  tree.root.find((node) => node.props.accessibilityRole === "link" && node.props.accessibilityLabel === label);
const texts = (node: ReactTestInstance) => node.findAllByType(Text).map((t) => t.props.children);

function signIn(avatar_url: string | null) {
  useAuthStore.setState({
    user: { id: "u1", full_name: "Rahim Uddin", email: "r@example.com", avatar_url },
  } as never);
}

afterEach(() => {
  mounted.splice(0).forEach((tree) => act(() => tree.unmount()));
  useAuthStore.setState({ user: null } as never);
});

describe("MobileNav", () => {
  it("marks Post as the current tab on the listing form", () => {
    const tree = mount("post");
    expect(tab(tree, "Post").props.accessibilityState).toEqual({ selected: true });
    expect(tab(tree, "Home").props.accessibilityState).toEqual({ selected: false });
  });

  it("shows the signed-in person's photo on the Account tab", () => {
    signIn("https://cdn.example.com/rahim.jpg");
    const account = tab(mount("home"), "Account");
    expect(account.findAllByType(Image)[0].props.source).toEqual({ uri: "https://cdn.example.com/rahim.jpg" });
  });

  it("shows their initials, not a stock photo, when they have none", () => {
    signIn(null);
    const account = tab(mount("home"), "Account");
    expect(account.findAllByType(Image)).toHaveLength(0);
    expect(texts(account)).toContain("RU");
  });
});

describe("initialsOf", () => {
  it("takes the first letters of the first and last name", () => {
    expect(initialsOf("Rahim Uddin")).toBe("RU");
    expect(initialsOf("  shah   redwan ahmed ")).toBe("SA");
    expect(initialsOf("Rahim")).toBe("R");
    expect(initialsOf("")).toBe("");
    expect(initialsOf(null)).toBe("");
  });
});
