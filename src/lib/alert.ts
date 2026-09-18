import { Alert, Platform } from "react-native";

/**
 * Cross-platform replacements for `Alert.alert`, which is a no-op on
 * react-native-web — the platform this app primarily ships to.
 */

type NotifyOptions = {
  /** Native button label. Defaults to "OK". */
  confirmLabel?: string;
  /** Runs after the user dismisses, on both platforms. */
  onConfirm?: () => void;
};

function asBody(title: string, message?: string) {
  return message ? `${title}\n\n${message}` : title;
}

export function notify(title: string, message?: string, options?: NotifyOptions) {
  if (Platform.OS === "web") {
    window.alert(asBody(title, message));
    options?.onConfirm?.();
    return;
  }

  Alert.alert(title, message, [
    { text: options?.confirmLabel ?? "OK", onPress: options?.onConfirm },
  ]);
}
