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

type ConfirmOptions = {
  /** Native confirm button label. Defaults to "OK". */
  confirmLabel?: string;
  /** Native cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Styles the native confirm button as destructive. */
  destructive?: boolean;
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

/**
 * Asks the user to confirm an action. Resolves `true` only when they confirm.
 *
 * The browser's confirm dialog only offers OK / Cancel, so word `message` so
 * that "OK" reads as the action (e.g. "Delete this listing?").
 */
export function confirmAction(
  title: string,
  message?: string,
  options?: ConfirmOptions,
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(asBody(title, message)));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: options?.cancelLabel ?? "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: options?.confirmLabel ?? "OK",
          style: options?.destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
