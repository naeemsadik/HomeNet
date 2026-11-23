import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Whether the on-screen keyboard is open. Always false on the web, where the
 * browser resizes the page itself and there is no keyboard event to listen to.
 *
 * Uses the "did" events: they fire on both platforms ("will" events are iOS
 * only), and the layout change they cause lands with the keyboard, not before.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
