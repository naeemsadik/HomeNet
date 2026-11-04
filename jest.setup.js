// AsyncStorage's official in-memory mock; the real module needs a native side.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// The app's map runs in a WebView, whose native side Jest does not have; see jest/webviewStub.js.
jest.mock("react-native-webview", () => require("./jest/webviewStub"));
