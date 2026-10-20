/**
 * Tests that run in the Android runtime, not the browser.
 *
 * The main suite (jest.config.js) uses the web preset, where `window`,
 * `document` and `localStorage` all exist. On a phone they do not, and code that
 * assumes them throws. These tests are named *.native.test.ts(x) and run here, so
 * a web-only assumption in shared code fails in CI instead of on a user's phone.
 */
module.exports = {
  preset: "jest-expo/android",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Icons are .mjs files Jest does not transform; see jest/lucideStub.js.
    "^lucide-react-native(/.*)?$": "<rootDir>/jest/lucideStub.js",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/*.native.test.ts", "**/*.native.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.expo/"],
  // jest-expo's list, plus the router's navigation package, which ships ES modules.
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm/)?((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation)",
  ],
};
