import { Platform } from "react-native";

/**
 * react-native-web has no native animation driver. Passing `true` there makes
 * every animating page log a "useNativeDriver is not supported" warning.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== "web";
