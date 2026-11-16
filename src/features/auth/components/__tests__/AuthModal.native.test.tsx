import React from "react";
import renderer, { act } from "react-test-renderer";
import { KeyboardAvoidingView, Platform } from "react-native";
import { AuthModal } from "../AuthModal";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock("@/stores/useAuthModalStore", () => ({
  useAuthModalStore: () => ({ visible: true, close: jest.fn(), onSuccess: undefined }),
}));
jest.mock("@/lib/postAuth", () => ({ goToPostAuthDestination: jest.fn() }));
jest.mock("../AuthCard", () => ({ AuthCard: () => null }));

/**
 * On Android the keyboard used to sit on top of the sign-in form: the wrapper
 * that lifts the card was switched on for iOS only, and with edge-to-edge
 * layout Android no longer resizes the window by itself. The password field and
 * the Sign in button ended up behind the keyboard.
 */
describe("the sign-in modal and the keyboard", () => {
  it.each(["android", "ios"] as const)("lifts the card above the keyboard on %s", (os) => {
    Platform.OS = os;
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AuthModal />);
    });
    expect(tree.root.findByType(KeyboardAvoidingView).props.behavior).toBe("padding");
    act(() => tree.unmount());
  });
});
