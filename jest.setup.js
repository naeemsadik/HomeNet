// AsyncStorage's official in-memory mock; the real module needs a native side.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest"),
);
