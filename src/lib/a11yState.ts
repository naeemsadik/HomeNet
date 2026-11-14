import { Platform } from "react-native";

/**
 * Accessibility state that React Native's prop types can't express.
 *
 * react-native-web 0.21 reads only `aria-*` props; it ignores the
 * `accessibilityState` object, so state written that way never reaches a
 * screen reader on the website (lint now forbids it). Most states have an
 * `aria-*` prop React Native accepts on both platforms: `aria-checked`,
 * `aria-selected`, `aria-expanded`, `aria-disabled`, `aria-busy`. Two do not,
 * and these helpers give each platform the right one. Spread the result onto a
 * Pressable or View.
 */
type StateProps = { "aria-selected"?: boolean };

/**
 * A button that is on or off (save, a filter chip, a toggle): `aria-pressed`
 * on the web. Native has no pressed state and announces it as selected.
 */
export function pressedState(pressed: boolean): StateProps {
  return Platform.OS === "web" ? ({ "aria-pressed": pressed } as unknown as StateProps) : { "aria-selected": pressed };
}

/**
 * The link or step the person is on now: `aria-current` on the web ("page" in
 * navigation, "step" in a wizard). Native announces it as selected.
 */
export function currentState(current: boolean, kind: "page" | "step" = "page"): StateProps {
  return Platform.OS === "web"
    ? ({ "aria-current": current ? kind : undefined } as unknown as StateProps)
    : { "aria-selected": current };
}
