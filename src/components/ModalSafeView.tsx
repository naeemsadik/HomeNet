import { useContext, type ComponentType } from "react";
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

type Props = ViewProps & {
  /** The element to draw, when the outer layer is not a plain View (a Pressable backdrop, say). */
  as?: ComponentType<any>;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  [prop: string]: unknown;
};

/**
 * The outer layer of a pop-up window. On Android the app draws edge to edge, so a
 * Modal covers the status bar and the navigation buttons too: a drawer's logo sat
 * under the clock, and a bottom sheet's buttons under the system keys. This adds
 * the safe-area insets on top of the style's own padding. Where there are no
 * insets (the web, most tests) the style is passed through untouched.
 */
export function ModalSafeView({ as, style, ...props }: Props) {
  // The context, not useSafeAreaInsets: that one throws where there is no provider.
  const insets = useContext(SafeAreaInsetsContext);
  const Tag = (as ?? View) as ComponentType<any>;

  if (!insets || (!insets.top && !insets.bottom)) return <Tag {...props} style={style} />;

  const flat: ViewStyle = StyleSheet.flatten(style) ?? {};
  const own = (side: "paddingTop" | "paddingBottom") => Number(flat[side] ?? flat.paddingVertical ?? flat.padding ?? 0);

  return (
    <Tag
      {...props}
      style={[style, { paddingTop: own("paddingTop") + insets.top, paddingBottom: own("paddingBottom") + insets.bottom }]}
    />
  );
}
