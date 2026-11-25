import React from "react";
import renderer, { act } from "react-test-renderer";
import { GoogleSignInButton } from "../GoogleSignInButton.android";

const CLIENT_ID = "123-abc.apps.googleusercontent.com";

jest.mock("@/lib/features", () => ({ GOOGLE_CLIENT_ID: "123-abc.apps.googleusercontent.com" }));
const mockNotify = jest.fn();
jest.mock("@/lib/alert", () => ({ notify: (...args: unknown[]) => mockNotify(...args) }));

const mockGoogle = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(async () => true),
  signOut: jest.fn(async () => null),
  signIn: jest.fn(),
};
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: mockGoogle,
  statusCodes: { SIGN_IN_CANCELLED: "12501", IN_PROGRESS: "ASYNC_OP_IN_PROGRESS", PLAY_SERVICES_NOT_AVAILABLE: "PLAY" },
}));

async function press(disabled = false) {
  const onCredential = jest.fn();
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<GoogleSignInButton mode="signin" disabled={disabled} onCredential={onCredential} />);
  });
  await act(async () => {
    await tree.root.findAll((node) => node.props.testID === "google-sign-in" && !!node.props.onPress)[0].props.onPress();
  });
  act(() => tree.unmount());
  return onCredential;
}

describe("Google sign-in in the Android app", () => {
  beforeEach(() => jest.clearAllMocks());

  it("asks for a token for the website's client id, after clearing the last account", async () => {
    mockGoogle.signIn.mockResolvedValue({ type: "success", data: { idToken: "token-1" } });
    const onCredential = await press();
    expect(mockGoogle.configure).toHaveBeenCalledWith({ webClientId: CLIENT_ID });
    expect(mockGoogle.signOut.mock.invocationCallOrder[0]).toBeLessThan(mockGoogle.signIn.mock.invocationCallOrder[0]);
    expect(onCredential).toHaveBeenCalledWith("token-1");
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it.each([
    ["the picker is closed", () => mockGoogle.signIn.mockResolvedValue({ type: "cancelled", data: null })],
    ["the library reports a cancel", () => mockGoogle.signIn.mockRejectedValue({ code: "12501" })],
  ])("says nothing when %s", async (_label, arrange) => {
    arrange();
    expect(await press()).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it.each([
    ["Google rejects the app (wrong certificate)", () => mockGoogle.signIn.mockRejectedValue({ code: "10" }), /sign you in with Google/],
    ["no token comes back", () => mockGoogle.signIn.mockResolvedValue({ type: "success", data: { idToken: null } }), /sign you in with Google/],
    ["Play services are missing", () => mockGoogle.hasPlayServices.mockRejectedValueOnce({ code: "PLAY" }), /isn't available/],
  ])("explains when %s", async (_label, arrange, message) => {
    arrange();
    expect(await press()).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify.mock.calls[0][1]).toMatch(message);
  });

  it("does nothing while the form is busy", async () => {
    await press(true);
    expect(mockGoogle.signIn).not.toHaveBeenCalled();
  });
});
