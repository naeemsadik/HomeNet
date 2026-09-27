import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { webPointer } from "@/theme";
import type { PropertyType } from "@/types/api";
import { PROPERTY_TYPE_CONFIGS, type PropertyTypeConfig } from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 1: title, category, subtype, purpose and description. */
export function WizardBasicsStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();
  const [descFocused, setDescFocused] = useState(false);

  return (
    <View style={styles.stepFormBody}>
      {/* Property Title */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Property Title *</Text>
        <TextInput
          onChangeText={(v) => store.setBasics({ title: v })}
          placeholder="e.g. Modern 3-Bedroom Apartment in Gulshan 2"
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.title}
        />
        <Text style={styles.formHelperText}>
          A clear, descriptive title attracts more serious buyers.
        </Text>
      </View>

      {/* Primary Category (Residential, Commercial, Land, Parking) */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Property Category *</Text>
        <View style={[styles.categoryGrid, isPhone && styles.categoryGridMobile]}>
          {(Object.keys(PROPERTY_TYPE_CONFIGS) as PropertyType[]).map((typeKey) => {
            const cfg = PROPERTY_TYPE_CONFIGS[typeKey];
            const isSelected = store.type === typeKey;
            const TypeIcon = cfg.icon;

            return (
              <Pressable
                key={typeKey}
                accessibilityLabel={cfg.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  store.setBasics({
                    type: typeKey,
                    subtype: cfg.defaultSubtype,
                    areaUnit: cfg.defaultUnit,
                  });
                }}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                  webPointer,
                ]}
              >
                <View
                  style={[
                    styles.categoryIconWrap,
                    isSelected && styles.categoryIconWrapSelected,
                  ]}
                >
                  <TypeIcon
                    color={isSelected ? "#04cf92" : "#5C6B66"}
                    size={20}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}
                >
                  {cfg.label}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.categoryDesc,
                    isSelected && styles.categoryDescSelected,
                  ]}
                >
                  {cfg.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Property Subtypes (Specific to Category) */}
      <View style={styles.formGroup}>
        <View style={styles.formLabelRow}>
          <Text style={styles.formLabel}>
            {activeTypeConfig.label} Subtype *
          </Text>
          <Text style={styles.formHint}>Select specific unit classification</Text>
        </View>
        <View style={styles.subtypeWrap}>
          {activeTypeConfig.subtypes.map((sub) => {
            const isSelected = store.subtype === sub.value;
            return (
              <Pressable
                key={sub.value}
                accessibilityLabel={sub.label}
                accessibilityRole="button"
                onPress={() => store.setBasics({ subtype: sub.value })}
                style={[
                  styles.subtypePill,
                  isSelected && styles.subtypePillSelected,
                  webPointer,
                ]}
              >
                {isSelected ? <Check color="#04cf92" size={14} /> : null}
                <Text
                  style={[
                    styles.subtypePillText,
                    isSelected && styles.subtypePillTextSelected,
                  ]}
                >
                  {sub.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Listing Purpose */}
      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Listing Purpose *</Text>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => {
                store.setBasics({
                  listingType: "sale",
                  ...(store.subtype === "short-let" ? { subtype: "apartment" } : {}),
                });
              }}
              style={[
                styles.toggleBtn,
                store.listingType === "sale" && store.subtype !== "short-let" && styles.toggleBtnActive,
                webPointer,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.toggleBtnText,
                  store.listingType === "sale" && store.subtype !== "short-let" && styles.toggleBtnTextActive,
                ]}
              >
                For Sale
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                store.setBasics({
                  listingType: "rent",
                  ...(store.subtype === "short-let" ? { subtype: "apartment" } : {}),
                });
              }}
              style={[
                styles.toggleBtn,
                store.listingType === "rent" && store.subtype !== "short-let" && styles.toggleBtnActive,
                webPointer,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.toggleBtnText,
                  store.listingType === "rent" && store.subtype !== "short-let" && styles.toggleBtnTextActive,
                ]}
              >
                For Rent
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                store.setBasics({
                  listingType: "rent",
                  type: "residential",
                  subtype: "short-let",
                });
              }}
              style={[
                styles.toggleBtn,
                store.subtype === "short-let" && styles.toggleBtnActive,
                webPointer,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.toggleBtnText,
                  store.subtype === "short-let" && styles.toggleBtnTextActive,
                ]}
              >
                Short-let
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <View style={styles.formLabelRow}>
          <Text style={styles.formLabel}>Description *</Text>
          {store.description.trim().length > 0 && (
            <Text style={styles.formHelperCharCount}>
              {store.description.length} {store.description.length === 1 ? "char" : "chars"}
            </Text>
          )}
        </View>
        <TextInput
          multiline
          numberOfLines={4}
          onBlur={() => setDescFocused(false)}
          onFocus={() => setDescFocused(true)}
          onChangeText={(v) => store.setBasics({ description: v })}
          placeholder="Describe key features, nearby landmarks, orientation, and building condition..."
          placeholderTextColor="#899790"
          style={[styles.formTextarea, descFocused && styles.formTextareaFocused]}
          value={store.description}
        />
      </View>
    </View>
  );
}
