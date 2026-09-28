import { Check } from "@/components/icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { webPointer } from "@/theme";
import type { PropertyTypeConfig } from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 2: price, area and the fields this property type needs. */
export function WizardDetailsStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      {/* Price & Area Size Row */}
      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>
            Price (BDT) {store.subtype === "short-let" ? "/ night or / mo" : store.listingType === "rent" ? "/ month" : ""} *
          </Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={(v) => store.setDetails({ price: v })}
            placeholder={store.subtype === "short-let" ? "e.g. 5,000" : "e.g. 18,500,000"}
            placeholderTextColor="#899790"
            style={styles.formInput}
            value={store.price}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <View style={styles.formLabelRow}>
            <Text style={styles.formLabel}>Area Size *</Text>
            {/* Area unit selector */}
            <View style={styles.unitSelectorRow}>
              {activeTypeConfig.allowedUnits.map((u) => {
                const isUnitSelected = (store.areaUnit || activeTypeConfig.defaultUnit) === u;
                return (
                  <Pressable
                    key={u}
                    onPress={() => store.setDetails({ areaUnit: u })}
                    style={[
                      styles.unitPill,
                      isUnitSelected && styles.unitPillActive,
                      webPointer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitPillText,
                        isUnitSelected && styles.unitPillTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <TextInput
            keyboardType="numeric"
            onChangeText={(v) => store.setDetails({ areaSize: v })}
            placeholder={
              (store.areaUnit || activeTypeConfig.defaultUnit) === "katha"
                ? "e.g. 5"
                : "e.g. 2150"
            }
            placeholderTextColor="#899790"
            style={styles.formInput}
            value={store.areaSize}
          />
        </View>
      </View>

      {/* Conditional fields based on PROPERTY_TYPES_SPECIFICATION */}
      {(activeTypeConfig.hasBedrooms ||
        activeTypeConfig.hasBathrooms ||
        activeTypeConfig.hasFloor ||
        activeTypeConfig.hasFacing) && (
        <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
          {activeTypeConfig.hasBedrooms && (
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Bedrooms</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={(v) => store.setDetails({ bedrooms: v })}
                placeholder="3"
                placeholderTextColor="#899790"
                style={styles.formInput}
                value={store.bedrooms}
              />
            </View>
          )}

          {activeTypeConfig.hasBathrooms && (
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Bathrooms</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={(v) => store.setDetails({ bathrooms: v })}
                placeholder="3"
                placeholderTextColor="#899790"
                style={styles.formInput}
                value={store.bathrooms}
              />
            </View>
          )}

          {activeTypeConfig.hasFloor && (
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Floor Level</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={(v) => store.setDetails({ floor: v })}
                placeholder="7"
                placeholderTextColor="#899790"
                style={styles.formInput}
                value={store.floor}
              />
            </View>
          )}

          {activeTypeConfig.hasFacing && (
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Facing Direction</Text>
              <TextInput
                onChangeText={(v) => store.setDetails({ facing: v })}
                placeholder="South / East"
                placeholderTextColor="#899790"
                style={styles.formInput}
                value={store.facing}
              />
            </View>
          )}
        </View>
      )}

      {/* Type-Specific Amenities Checklist */}
      <View style={styles.formGroup}>
        <View style={styles.formLabelRow}>
          <Text style={styles.formLabel}>
            {activeTypeConfig.label} Amenities & Features
          </Text>
          <Text style={styles.formHint}>Select all that apply</Text>
        </View>
        <View style={styles.amenitiesWrap}>
          {activeTypeConfig.amenities.map((item) => {
            const isSelected = !!store.amenities[item.key];
            return (
              <Pressable
                key={item.key}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => store.toggleAmenity(item.key)}
                style={[
                  styles.amenityPill,
                  isSelected && styles.amenityPillSelected,
                  webPointer,
                ]}
              >
                {isSelected ? <Check color="#04cf92" size={14} /> : null}
                <Text
                  style={[
                    styles.amenityPillText,
                    isSelected && styles.amenityPillTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
