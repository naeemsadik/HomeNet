import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { Check, ChevronDown } from "@/components/icons";
import { colorTokens, fonts } from "@/theme";

export interface PickerOption {
  label: string;
  value: string;
}

/**
 * A drop-down for phones: the closed box shows the choice, a tap opens a sheet
 * with every option as a full-height row, and choosing one closes it. The browser
 * has its own <select>; Android and iOS have none that React Native can use, and
 * without this the filter boxes were only text.
 */
export function OptionPicker({
  value,
  options,
  onChange,
  disabled,
  style,
  accessibilityLabel,
}: {
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();
  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ? `${accessibilityLabel}: ${current?.label ?? ""}` : current?.label}
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.box, disabled && styles.boxDisabled, style]}
      >
        <Text numberOfLines={1} style={styles.boxText}>
          {current?.label.trim()}
        </Text>
        <ChevronDown color="#0B1A17" size={16} strokeWidth={2.2} />
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.layer}>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => setOpen(false)} style={styles.overlay} />
          <View style={[styles.sheet, { maxHeight: Math.round(height * 0.6) }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const selected = option.value === current?.value;
                return (
                  <Pressable
                    key={option.value || "__none__"}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setOpen(false);
                      if (option.value !== value) onChange(option.value);
                    }}
                    style={[styles.row, selected && styles.rowSelected]}
                  >
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{option.label}</Text>
                    {selected ? <Check color={colorTokens.primary} size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    paddingHorizontal: 14,
    gap: 8,
  },
  boxDisabled: { opacity: 0.55 },
  boxText: { flex: 1, fontSize: 14, color: "#0B1A17", fontFamily: fonts.regular },
  layer: { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(11, 26, 23, 0.45)" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 20,
    gap: 12,
  },
  rowSelected: { backgroundColor: "#E4F9F1" },
  rowText: { flex: 1, fontSize: 15, color: "#0B1A17", fontFamily: fonts.regular },
  rowTextSelected: { fontFamily: fonts.semiBold },
});
