import { Eye, EyeOff, AlertCircle, type LucideIcon } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors, fonts, webPointer } from "@/theme";

// ─── Floating-Label Input ──────────────────────────────────────────────────

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  error?: string | null;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
}

export function FloatingInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  error,
  icon: Icon,
  style,
  editable = true,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isActive = focused || !!value;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isActive ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 6],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 10],
  });

  const borderColor = error
    ? colors.coral
    : focused
      ? colors.green
      : colors.line;

  return (
    <View style={[styles.inputWrapper, style]}>
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          focused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {Icon ? (
          <View style={styles.inputIconWrap}>
            <Icon
              size={17}
              color={error ? colors.coral : focused ? colors.green : colors.muted}
            />
          </View>
        ) : null}

        <View style={styles.inputInner}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                top: labelTop,
                fontSize: labelSize as unknown as number,
                color: error
                  ? colors.coral
                  : focused
                    ? colors.green
                    : colors.muted,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={secureTextEntry && !passwordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
            style={[
              styles.textInput,
              Icon ? styles.textInputWithIcon : undefined,
              isActive ? styles.textInputActive : styles.textInputInactive,
            ]}
            placeholderTextColor="transparent"
          />
        </View>

        {secureTextEntry ? (
          <Pressable
            onPress={() => setPasswordVisible((v) => !v)}
            style={[styles.toggleButton, webPointer]}
            accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? (
              <EyeOff size={18} color={colors.muted} />
            ) : (
              <Eye size={18} color={colors.muted} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.fieldErrorRow}>
          <AlertCircle size={12} color={colors.coral} />
          <Text style={styles.fieldErrorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Inline Error Banner ───────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string | null;
  style?: StyleProp<ViewStyle>;
}

export function ErrorBanner({ message, style }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <View style={[styles.errorBanner, style]}>
      <AlertCircle size={16} color={colors.coral} />
      <Text style={styles.errorBannerText}>{message}</Text>
    </View>
  );
}

// ─── Auth Button (with spinner overlay) ────────────────────────────────────

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon: Icon,
  style,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.authButton,
        variant === "primary" && styles.authButtonPrimary,
        variant === "secondary" && styles.authButtonSecondary,
        variant === "ghost" && styles.authButtonGhost,
        isDisabled && variant === "primary" && styles.authButtonDisabled,
        style,
        webPointer,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : colors.green}
        />
      ) : (
        <>
          {Icon ? (
            <Icon
              size={16}
              color={
                variant === "primary"
                  ? "#FFFFFF"
                  : variant === "ghost"
                    ? colors.muted
                    : colors.green
              }
            />
          ) : null}
          <Text
            style={[
              styles.authButtonLabel,
              variant === "primary" && styles.authButtonLabelPrimary,
              variant !== "primary" && styles.authButtonLabelSecondary,
              variant === "ghost" && styles.authButtonLabelGhost,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ─── Divider with text ─────────────────────────────────────────────────────

export function Divider({ text }: { text?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {text ? <Text style={styles.dividerText}>{text}</Text> : null}
      <View style={styles.dividerLine} />
    </View>
  );
}

// ─── Success Banner ────────────────────────────────────────────────────────

export function SuccessBanner({ message, style }: { message: string | null; style?: StyleProp<ViewStyle> }) {
  if (!message) return null;
  return (
    <View style={[styles.successBanner, style]}>
      <Text style={styles.successBannerText}>{message}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressed: { opacity: 0.82 },

  // Floating Input
  inputWrapper: { marginBottom: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.soft,
    overflow: "hidden",
  },
  inputContainerFocused: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerError: {
    backgroundColor: "#FFFBFB",
    borderColor: colors.coral,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  inputIconWrap: {
    paddingLeft: 14,
    justifyContent: "center",
  },
  inputInner: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    minHeight: 56,
  },
  floatingLabel: {
    position: "absolute",
    left: 14,
    right: 14,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.2,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 8,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 14,
    minHeight: 56,
    outlineStyle: "none",
  } as any,
  textInputWithIcon: {
    paddingLeft: 10,
  },
  textInputActive: {},
  textInputInactive: {},
  toggleButton: {
    paddingHorizontal: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  fieldErrorText: {
    color: colors.coral,
    fontFamily: fonts.medium,
    fontSize: 11,
    flexShrink: 1,
  },

  // Error Banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F9D8D8",
    marginBottom: 18,
  },
  errorBannerText: {
    color: colors.coral,
    fontFamily: fonts.medium,
    fontSize: 13,
    flexShrink: 1,
    lineHeight: 18,
  },

  // Success Banner
  successBanner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.greenLight,
    borderWidth: 1,
    borderColor: "#C4E4D5",
    marginBottom: 18,
  },
  successBannerText: {
    color: colors.greenDark,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },

  // Auth Button
  authButton: {
    minHeight: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  authButtonPrimary: {
    backgroundColor: colors.green,
  },
  authButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  authButtonGhost: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  authButtonDisabled: {
    backgroundColor: "#9BADA3",
  },
  authButtonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  authButtonLabelPrimary: { color: "#FFFFFF" },
  authButtonLabelSecondary: { color: colors.green },
  authButtonLabelGhost: { color: colors.muted },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
