import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { Keyboard, TextInput } from "react-native";
import { AuthCard } from "../AuthCard";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("@/components/GoogleSignInButton", () => ({ GoogleSignInButton: () => null }));
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), GOOGLE_SIGN_IN_AVAILABLE: false }));

const mockLogin = jest.fn().mockResolvedValue(false);
const mockAuth = { loading: false, error: null as string | null, errorCode: null as number | null };
jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    login: mockLogin,
    register: jest.fn().mockResolvedValue(false),
    googleLogin: jest.fn(),
    loading: mockAuth.loading,
    error: mockAuth.error,
    errorCode: mockAuth.errorCode,
    clearError: jest.fn(),
  }),
}));

/**
 * With the keyboard up on a phone, the brand header (logo, wordmark, subtitle and
 * photo) took about 40% of the sign-in card, so the fields and the Sign in /
 * Create account button sat under the keyboard. And the return key did nothing,
 * so there was no way forward without closing the keyboard.
 */
describe("the sign-in card with the keyboard open", () => {
  const listeners: Record<string, () => void> = {};

  beforeEach(() => {
    jest.spyOn(Keyboard, "addListener").mockImplementation(((event: string, cb: () => void) => {
      listeners[event] = cb;
      return { remove: jest.fn() };
    }) as unknown as typeof Keyboard.addListener);
    mockLogin.mockClear();
    mockAuth.loading = false;
    mockAuth.error = null;
    mockAuth.errorCode = null;
  });

  afterEach(() => jest.restoreAllMocks());

  const render = (isModal = true) => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AuthCard isModal={isModal} showClose onClose={() => {}} />);
    });
    return tree;
  };
  const byTestId = (tree: renderer.ReactTestRenderer, id: string) =>
    tree.root.findAll((node: ReactTestInstance) => node.props.testID === id);
  const inputs = (tree: renderer.ReactTestRenderer) => tree.root.findAllByType(TextInput);

  it("collapses the header to the wordmark while the keyboard is open, and restores it after", () => {
    const tree = render();
    expect(byTestId(tree, "auth-header")).not.toHaveLength(0);

    act(() => listeners.keyboardDidShow());
    expect(byTestId(tree, "auth-header-compact")).not.toHaveLength(0);
    expect(byTestId(tree, "auth-header")).toHaveLength(0);

    act(() => listeners.keyboardDidHide());
    expect(byTestId(tree, "auth-header")).not.toHaveLength(0);
    act(() => tree.unmount());
  });

  it("keeps the full header on the sign-in page, where it is not a modal", () => {
    const tree = render(false);
    act(() => listeners.keyboardDidShow());
    expect(byTestId(tree, "auth-header-compact")).toHaveLength(0);
    act(() => tree.unmount());
  });

  it("moves from email to password with Next, and signs in with Go", async () => {
    const tree = render();
    const [email, password] = inputs(tree);
    expect(email.props.returnKeyType).toBe("next");
    expect(password.props.returnKeyType).toBe("go");

    act(() => email.props.onChangeText("owner@example.com"));
    act(() => password.props.onChangeText("a-test-password"));
    await act(async () => {
      password.props.onSubmitEditing();
    });
    expect(mockLogin).toHaveBeenCalledWith({ email: "owner@example.com", password: "a-test-password" });
    act(() => tree.unmount());
  });

  it("does not send a second sign-in from the keyboard while one is in flight", async () => {
    mockAuth.loading = true;
    const tree = render();
    const [email, password] = inputs(tree);
    act(() => email.props.onChangeText("owner@example.com"));
    act(() => password.props.onChangeText("a-test-password"));
    await act(async () => {
      password.props.onSubmitEditing();
    });
    expect(mockLogin).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it("walks the four sign-up fields in order, the last one submitting", () => {
    const tree = render();
    const createTab = tree.root.findAll(
      (node: ReactTestInstance) => typeof node.props.onPress === "function" && node.props.accessibilityRole === "button",
    )[2];
    act(() => createTab.props.onPress());
    const fields = inputs(tree);
    expect(fields).toHaveLength(4);
    expect(fields.map((field) => field.props.returnKeyType)).toEqual(["next", "next", "next", "go"]);
    act(() => tree.unmount());
  });

  it("offers Sign in instead when the email already has an account, keeping the email", () => {
    mockAuth.error = "An account with this email already exists. Please sign in instead.";
    mockAuth.errorCode = 1101;
    const tree = render();
    const createTab = tree.root.findAll(
      (node: ReactTestInstance) => typeof node.props.onPress === "function" && node.props.accessibilityRole === "button",
    )[2];
    act(() => createTab.props.onPress());
    const [, email] = inputs(tree);
    act(() => email.props.onChangeText("owner@example.com"));

    const instead = tree.root.findAll((node: ReactTestInstance) => node.props.testID === "auth-sign-in-instead" && typeof node.props.onPress === "function");
    expect(instead).toHaveLength(1);
    act(() => instead[0].props.onPress());

    const signInFields = inputs(tree);
    expect(signInFields).toHaveLength(2);
    expect(signInFields[0].props.value).toBe("owner@example.com");
    act(() => tree.unmount());
  });
});
