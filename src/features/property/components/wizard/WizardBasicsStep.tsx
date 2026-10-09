import { Check, Plus } from "@/components/icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { webPointer } from "@/theme";
import type { PropertyType } from "@/types/api";
import {
  CUSTOM_SUBTYPE_MAX_LENGTH,
  PROPERTY_TYPE_CONFIGS,
  cleanCustomSubtype,
  findKnownSubtype,
  type PropertyTypeConfig,
} from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 1: title, category, subtype, purpose and description. */
export function WizardBasicsStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();
  const [descFocused, setDescFocused] = useState(false);

  // "Other": the owner types a subtype that isn't listed. It is also shown when
  // a link or the AI already supplied one the list doesn't have.
  const [otherPicked, setOtherPicked] = useState(false);
  const isListed = activeTypeConfig.subtypes.some((sub) => sub.value === store.subtype);
  const showOther =
    activeTypeConfig.allowsCustomSubtype && (otherPicked || (store.subtype !== "" && !isListed));

  /** A typed subtype that means a listed one ("duplex") becomes that option, so spellings don't split search. */
  const settleCustomSubtype = () => {
    const match = findKnownSubtype(activeTypeConfig, store.subtype);
    if (match) {
      store.setBasics({ subtype: match.value });
      setOtherPicked(false);
    } else {
      store.setBasics({ subtype: cleanCustomSubtype(store.subtype) });
    }
  };

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
                  setOtherPicked(false);
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
                onPress={() => {
                  setOtherPicked(false);
                  store.setBasics({ subtype: sub.value });
                }}
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
          {activeTypeConfig.allowsCustomSubtype ? (
            <Pressable
              accessibilityHint="Type a subtype that is not in the list"
              accessibilityLabel="Other subtype"
              accessibilityRole="button"
              accessibilityState={{ selected: showOther }}
              onPress={() => {
                setOtherPicked(true);
                // Keep what is already typed; leave the field empty after a listed option.
                if (isListed) store.setBasics({ subtype: "" });
              }}
              style={[
                styles.subtypePill,
                showOther && styles.subtypePillSelected,
                webPointer,
              ]}
            >
              {showOther ? <Check color="#04cf92" size={14} /> : <Plus color="#5C6B66" size={14} />}
              <Text
                style={[
                  styles.subtypePillText,
                  showOther && styles.subtypePillTextSelected,
                ]}
              >
                Other
              </Text>
            </Pressable>
          ) : null}
        </View>
        {showOther ? (
          <View style={styles.customSubtypeGroup}>
            <TextInput
              accessibilityLabel="Your property subtype"
              autoFocus={otherPicked}
              maxLength={CUSTOM_SUBTYPE_MAX_LENGTH}
              onBlur={settleCustomSubtype}
              onChangeText={(v) => {
                // Once the owner types, the field stays until they leave it, even if the text spells a listed option.
                setOtherPicked(true);
                store.setBasics({ subtype: v });
              }}
              placeholder="e.g. Farmhouse, Guest house, Co-working space"
              placeholderTextColor="#899790"
              style={styles.formInput}
              value={store.subtype}
            />
            <Text style={styles.formHelperText}>
              A short name buyers will recognise. {store.subtype.length}/{CUSTOM_SUBTYPE_MAX_LENGTH}
            </Text>
          </View>
        ) : null}
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
                setOtherPicked(false);
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
