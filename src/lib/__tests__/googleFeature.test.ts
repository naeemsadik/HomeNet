const VALID = "63352692878-eb3rpke5sn8ojmq2svkfpjrq3pgnpbjm.apps.googleusercontent.com";

function load(clientId: string | undefined) {
  const previous = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (clientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  else process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = clientId;
  try {
    let features!: typeof import("@/lib/features");
    jest.isolateModules(() => {
      features = require("@/lib/features");
    });
    return features;
  } finally {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    else process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = previous;
  }
}

describe("Google sign-in availability", () => {
  it("is on for the website when a well-formed client id is set", () => {
    const { GOOGLE_CLIENT_ID, GOOGLE_SIGN_IN_AVAILABLE } = load(VALID);
    expect(GOOGLE_CLIENT_ID).toBe(VALID);
    expect(GOOGLE_SIGN_IN_AVAILABLE).toBe(true);
  });

  it("ignores surrounding whitespace in the variable", () => {
    expect(load(`  ${VALID}\n`).GOOGLE_CLIENT_ID).toBe(VALID);
  });

  it.each([
    ["unset", undefined],
    ["empty", ""],
    ["blank", "   "],
    ["a client secret pasted by mistake", "GOCSPX-notAnId"],
    ["an id for another host", "123-abc.apps.example.com"],
    ["an id with a path", `${VALID}/extra`],
    ["a quoted id", `"${VALID}"`],
  ])("is off when the client id is %s", (_label, value) => {
    const { GOOGLE_CLIENT_ID, GOOGLE_SIGN_IN_AVAILABLE } = load(value);
    expect(GOOGLE_CLIENT_ID).toBeNull();
    expect(GOOGLE_SIGN_IN_AVAILABLE).toBe(false);
  });
});
