import { useEffect, useRef } from "react";
import { Platform, Text, type TextProps } from "react-native";

/**
 * Text that browser translation must leave alone: prices, counts, phone numbers.
 * React Native Web strips `translate` and `className`, so they are set on the
 * DOM node after mount (same approach as Brand and LanguageToggle).
 */
export function NoTranslateText(props: TextProps) {
  const ref = useRef<Text>(null);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  }, []);
  return <Text ref={ref} {...props} />;
}
