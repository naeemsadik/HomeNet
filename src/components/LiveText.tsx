import { Children, type ReactNode } from "react";
import { Text, type TextProps } from "react-native";

/**
 * Text whose content changes in place: counts, totals, page numbers.
 *
 * Bangla is Google Translate, which swaps each text node for a translated
 * copy. When React later updates the original node, readers keep seeing the
 * old translation: "০টি সম্পত্তি পাওয়া গেছে" stayed on screen after the
 * listings loaded. Keying the element by its text makes React mount a fresh
 * node on every change, which Google translates anew.
 */
export function LiveText({ children, ...props }: TextProps & { children?: ReactNode }) {
  const content = Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? child : ""))
    .join("");
  return (
    <Text key={content} {...props}>
      {children}
    </Text>
  );
}
