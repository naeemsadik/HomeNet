import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { Check, type LucideIcon } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

/**
 * A pill people tap to choose. `role` says how: "radio" for one of several,
 * "checkbox" for on and off, "button" for an action (removing a filter).
 */
export function MessChip({
  label,
  selected = false,
  onPress,
  role = "checkbox",
  icon: Icon,
  disabled = false,
  accessibilityLabel,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  role?: "radio" | "checkbox" | "button";
  icon?: LucideIcon;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = disabled ? colorTokens.subtle : selected ? colorTokens.brandText : colorTokens.body;
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      aria-checked={role === "button" ? undefined : selected}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.chip,
        selected && styles.selected,
        hovered && !selected && !disabled && styles.hovered,
        disabled && styles.disabled,
        pressed && styles.pressed,
        webPointer,
        style,
      ]}
    >
      {selected && role !== "button" ? <Check size={14} color={fg} strokeWidth={2.5} /> : Icon ? <Icon size={14} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  selected: { backgroundColor: colorTokens.brandSurface, borderColor: colorTokens.brandBorder },
  hovered: { backgroundColor: colorTokens.surfaceSunken },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  labelSelected: { fontFamily: fonts.semiBold },
});
