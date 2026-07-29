import { router, type Href } from "expo-router";
import { ArrowRight, Check, ChevronDown, type LucideIcon } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";
import { colors, fonts, webPointer } from "@/theme";

export function AppLink({
  href,
  children,
  style,
  accessibilityLabel,
  onPress,
}: {
  href: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  onPress?: () => void;
}) {
  const open = () => {
    onPress?.();
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) {
      void Linking.openURL(href);
      return;
    }
    router.push(href as Href);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
      onPress={open}
      style={({ pressed }) => [webPointer, style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function AppButton({
  label,
  onPress,
  icon: Icon,
  trailingIcon: TrailingIcon,
  variant = "primary",
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "ghost" && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        style,
        webPointer,
        pressed && styles.pressed,
      ]}
    >
      {Icon ? <Icon size={15} color={variant === "primary" ? colors.white : colors.green} /> : null}
      <Text
        style={[
          styles.buttonLabel,
          variant === "primary" ? styles.buttonLabelPrimary : styles.buttonLabelSecondary,
          disabled && styles.buttonLabelDisabled,
        ]}
      >
        {label}
      </Text>
      {TrailingIcon ? (
        <TrailingIcon size={15} color={variant === "primary" ? colors.white : colors.green} />
      ) : null}
    </Pressable>
  );
}

export function Eyebrow({ children, light = false, style }: { children: ReactNode; light?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.eyebrow, light && styles.eyebrowLight, style]}>{children}</Text>;
}

export function SectionHeader({
  eyebrow,
  title,
  action = "View all",
  href,
  onAction,
  right,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  href?: string;
  onAction?: () => void;
  right?: ReactNode;
}) {
  const actionContent = (
    <View style={styles.textLinkInner}>
      <Text style={styles.textLinkText}>{action}</Text>
      <ArrowRight color={colors.green} size={15} />
    </View>
  );

  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        {eyebrow ? <Eyebrow style={styles.headingEyebrow}>{eyebrow}</Eyebrow> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {right ??
        (href ? (
          <AppLink href={href} style={styles.textLink}>
            {actionContent}
          </AppLink>
        ) : (
          <Pressable onPress={onAction} style={[styles.textLink, webPointer]}>
            {actionContent}
          </Pressable>
        ))}
    </View>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  style,
  ...rest
}: {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
} & Omit<TextInputProps, "style">) {
  return (
    <TextInput
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#899790"
      style={[styles.field, multiline && styles.multiline, style]}
      value={value}
      {...rest}
    />
  );
}

export function SelectField({
  value,
  options,
  onChange,
  style,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.selectWrap, style]}>
      <Pressable accessibilityLabel={`Select ${value}`} onPress={() => setOpen(true)} style={[styles.selectButton, webPointer]}>
        <Text numberOfLines={1} style={styles.selectValue}>{value}</Text>
        <ChevronDown color={colors.green} size={14} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.selectModalLayer}>
          <Pressable accessibilityLabel="Close options" onPress={() => setOpen(false)} style={styles.selectModalOverlay} />
          <View style={styles.selectMenu}>
            {options.map((option) => {
              const selected = value === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  style={[styles.selectOption, selected && styles.selectOptionActive, webPointer]}
                >
                  <Text style={[styles.selectOptionText, selected && styles.selectOptionTextActive]}>{option}</Text>
                  {selected ? <Check color={colors.green} size={15} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.78 },
  button: {
    minHeight: 41,
    paddingHorizontal: 17,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
  },
  buttonPrimary: { backgroundColor: colors.green, borderColor: colors.green },
  buttonSecondary: { backgroundColor: colors.white, borderColor: colors.line },
  buttonGhost: { backgroundColor: "transparent", borderColor: "transparent", paddingHorizontal: 0 },
  buttonDisabled: { backgroundColor: colors.soft, borderColor: colors.line },
  buttonLabel: { fontFamily: fonts.extraBold, fontSize: 10 },
  buttonLabelPrimary: { color: colors.white },
  buttonLabelSecondary: { color: colors.green },
  buttonLabelDisabled: { color: "#A0ACA6" },
  eyebrow: {
    color: colors.green,
    fontFamily: fonts.extraBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  eyebrowLight: { color: "rgba(255,255,255,0.82)" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 18,
  },
  sectionHeadingCopy: { flexShrink: 1 },
  headingEyebrow: { marginBottom: 4 },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    letterSpacing: -1,
  },
  textLink: { paddingVertical: 5 },
  textLinkInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  textLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 10 },
  field: {
    minHeight: 42,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  multiline: { minHeight: 76, textAlignVertical: "top" },
  selectWrap: { minHeight: 42, justifyContent: "center", overflow: "hidden" },
  selectButton: { minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingHorizontal: 10 },
  selectValue: { minWidth: 0, flex: 1, color: colors.ink, fontFamily: fonts.semiBold, fontSize: 10 },
  selectModalLayer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  selectModalOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(6,28,20,0.28)" },
  selectMenu: { width: "100%", maxWidth: 320, overflow: "hidden", padding: 6, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  selectOption: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 12, borderRadius: 9 },
  selectOptionActive: { backgroundColor: colors.greenLight },
  selectOptionText: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 11 },
  selectOptionTextActive: { color: colors.greenDark, fontFamily: fonts.extraBold },
});
