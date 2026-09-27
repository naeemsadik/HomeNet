/** Unit tests. The web preset: the app ships primarily to web, and the
 *  language helpers need a DOM (document.cookie, localStorage). */
module.exports = {
  preset: "jest-expo/web",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.expo/"],
};
