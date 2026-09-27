// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "android/*", "ios/*", "web-build/*"],
  },
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      // Unused imports fail lint; `npm run lint -- --fix` removes them.
      // unused-imports/no-unused-vars replaces the TS rule (same options as
      // eslint-config-expo) so the two don't report the same thing twice.
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", args: "none", ignoreRestSiblings: true, caughtErrors: "all" },
      ],
      "react-hooks/exhaustive-deps": "warn",
      // React Compiler rules that eslint-config-expo enables as errors. The
      // existing code predates them (e.g. `useRef(new Animated.Value()).current`),
      // so they warn until those components are reworked.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      // Guards against HTML-parsing surprises in DOM JSX; React Native <Text>
      // renders ' and " literally, so escaping copy would only hurt reading it.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Warn, not error: the codebase has existing `any` debt to pay down.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Jest globals, and require() inside jest.isolateModules to reload a module.
    files: ["jest.setup.js", "**/__tests__/**"],
    languageOptions: { globals: { jest: "readonly" } },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
