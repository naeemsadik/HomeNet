import { Platform } from "react-native";

const VALID = "63352692878-eb3rpke5sn8ojmq2svkfpjrq3pgnpbjm.apps.googleusercontent.com";

describe("Google sign-in availability in the app", () => {
  const realOs = Platform.OS;
  const previous = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  afterEach(() => {
    Platform.OS = realOs;
    if (previous === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    else process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = previous;
  });

  it.each([
    ["android", VALID, true],
    ["android", "", false],
    ["ios", VALID, false],
  ] as const)("on %s with client id %p is %s", (os, clientId, available) => {
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = clientId;
    jest.isolateModules(() => {
      const rn = require("react-native") as typeof import("react-native");
      rn.Platform.OS = os;
      expect(require("@/lib/features").GOOGLE_SIGN_IN_AVAILABLE).toBe(available);
    });
  });
});
