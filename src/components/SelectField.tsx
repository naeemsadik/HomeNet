import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ChevronDown } from "@/components/icons";
import { OptionPicker } from "@/components/OptionPicker";
import { colorTokens, fonts } from "@/theme";

// The control border is a solid input grey with no token equivalent — the
// `divider` token is an 8% ink wash and reads noticeably lighter here.
const CONTROL_BORDER = "#D0D5DD";

/**
 * A dropdown that uses the platform's own control: a real `<select>` on web, so
 * the keyboard and screen reader behave as the browser intends, and on Android
 * and iOS an OptionPicker sheet — the old native branch only drew the current
 * value, so the filters could not be changed on a phone at all.
 *
 * Lifted out of RightmoveFilterCard so the filters modal can show the same
 * ladders rather than free-text inputs that produced values no dropdown could
 * match.
 */
export function SelectField({
  value,
  options,
  onChange,
  style,
  accessibilityLabel,
  disabled,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  style?: any;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.selectWrapper, style]}>
        {/* @ts-ignore Web-only select element for native browser dropdown support */}
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          aria-label={accessibilityLabel}
          disabled={disabled}
          style={{
            width: "100%",
            height: 42,
            minHeight: 42,
            display: "block",
            padding: "0 34px 0 14px",
            backgroundColor: colorTokens.surface,
            border: `1.5px solid ${CONTROL_BORDER}`,
            borderRadius: 8,
            fontSize: 14,
            fontFamily: fonts.regular,
            color: colorTokens.ink,
            fontWeight: "500",
            appearance: "none",
            WebkitAppearance: "none",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.55 : 1,
            boxSizing: "border-box",
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <View style={styles.chevronOverlay} pointerEvents="none">
          <ChevronDown color={colorTokens.ink} size={16} strokeWidth={2.2} />
        </View>
      </View>
    );
  }

  // Android and iOS: a tap opens a sheet of options.
  return (
    <OptionPicker
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onChange={onChange}
      options={options}
      style={style}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  selectWrapper: {
    position: "relative",
    width: "100%",
    height: 42,
  },
  chevronOverlay: {
    position: "absolute",
    right: 12,
    top: 13,
  },
  nativeSelectWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 42,
    backgroundColor: colorTokens.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: CONTROL_BORDER,
    paddingHorizontal: 14,
  },
  nativeSelectText: {
    fontSize: 14,
    color: colorTokens.ink,
    fontFamily: fonts.regular,
  },
});
