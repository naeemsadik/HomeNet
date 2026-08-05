import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  MapPin,
  ChevronDown,
} from "lucide-react-native";
import { FloatingInput } from "@/components/AuthFormFields";
import { AreaPicker } from "@/components/AreaPicker";
import { colorTokens, fontTokens, webPointer } from "@/theme";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";
import type { Area } from "@/types/api";

const PROPERTY_TYPES = ["residential", "commercial", "land", "parking"] as const;
const LISTING_TYPES = ["sale", "rent"] as const;

function SelectPicker({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selectBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
      >
        <Text style={styles.selectValue}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Text>
        <ChevronDown color={colorTokens.textMuted} size={16} />
      </Pressable>

      {open ? (
        <View style={styles.dropdown}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={[
                styles.dropdownItem,
                value === opt && styles.dropdownItemActive,
              ]}
            >
              <Text
                style={[
                  styles.dropdownText,
                  value === opt && styles.dropdownTextActive,
                ]}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function WizardStepBasics() {
  const {
    title, type, subtype, listingType, price, areaSize,
    areaId, areaName, address, description,
    setBasics,
  } = usePropertyWizardStore();

  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(
    areaId ? ({ id: areaId, name: areaName } as Area) : null,
  );

  const handleSelectArea = (area: Area | null) => {
    setSelectedArea(area);
    if (area) {
      setBasics({ areaId: area.id, areaName: area.name });
    } else {
      setBasics({ areaId: "", areaName: "" });
    }
    setAreaPickerOpen(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>Property Basics</Text>
        <Text style={styles.subtitle}>
          Tell us about your property. Fields marked with * are required for verification.
        </Text>
      </View>

      <View style={styles.form}>
        <FloatingInput
          label="Title *"
          value={title}
          onChangeText={(v) => setBasics({ title: v })}
          autoCapitalize="sentences"
        />

        <SelectPicker
          label="Property Type *"
          value={type}
          options={PROPERTY_TYPES}
          onSelect={(v) => setBasics({ type: v as typeof type })}
        />

        <FloatingInput
          label="Subtype (e.g., Apartment, Condo)"
          value={subtype}
          onChangeText={(v) => setBasics({ subtype: v })}
          autoCapitalize="words"
        />

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Listing Type *</Text>
          <View style={styles.toggleGroup}>
            {LISTING_TYPES.map((lt) => {
              const active = listingType === lt;
              return (
                <Pressable
                  key={lt}
                  onPress={() => setBasics({ listingType: lt })}
                  style={({ pressed }) => [
                    styles.toggleBtn,
                    active && styles.toggleBtnActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      active && styles.toggleTextActive,
                    ]}
                  >
                    {lt === "sale" ? "For Sale" : "For Rent"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FloatingInput
          label="Price (BDT) *"
          value={price}
          onChangeText={(v) => setBasics({ price: v.replace(/[^0-9.]/g, "") })}
          keyboardType="numeric"
        />

        <FloatingInput
          label="Area Size (sqft)"
          value={areaSize}
          onChangeText={(v) => setBasics({ areaSize: v.replace(/[^0-9.]/g, "") })}
          keyboardType="numeric"
        />

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Area / Location *</Text>
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={({ pressed }) => [
              styles.selectBtn,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select area"
          >
            <MapPin color={colorTokens.primary} size={16} />
            <Text
              style={[
                styles.selectValue,
                !areaId && styles.selectPlaceholder,
              ]}
              numberOfLines={1}
            >
              {areaName || "Select area..."}
            </Text>
          </Pressable>
        </View>

        <FloatingInput
          label="Address (optional)"
          value={address}
          onChangeText={(v) => setBasics({ address: v })}
          autoCapitalize="sentences"
        />

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(v) => setBasics({ description: v })}
            placeholder="Describe your property..."
            placeholderTextColor={colorTokens.textMuted}
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>
      </View>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        onSelect={handleSelectArea}
        selectedArea={selectedArea}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 6,
  },
  header: {
    gap: 6,
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  form: {
    gap: 4,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    marginBottom: 6,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  selectValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  selectPlaceholder: {
    color: colorTokens.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
  toggleRow: {
    marginBottom: 12,
  },
  toggleGroup: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
  },
  toggleBtnActive: {
    backgroundColor: colorTokens.primary,
    borderColor: colorTokens.primary,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  toggleTextActive: {
    color: colorTokens.textInverse,
    fontFamily: fontTokens.bold,
  },
  textArea: {
    minHeight: 100,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colorTokens.divider,
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textPrimary,
    textAlignVertical: "top",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    shadowColor: colorTokens.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: colorTokens.primaryLight,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  dropdownTextActive: {
    color: colorTokens.primary,
    fontFamily: fontTokens.bold,
  },
});
