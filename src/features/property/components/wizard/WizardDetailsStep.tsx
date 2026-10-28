import { Check } from "@/components/icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { priceOnRequestLabel, useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { webPointer } from "@/theme";
import type { PropertyTypeConfig } from "../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 2: price, area and the fields this property type needs. */
export function WizardDetailsStep({ activeTypeConfig }: { activeTypeConfig: PropertyTypeConfig }) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();
  const onRequest = store.priceOnRequest;

  const priceSuffix = store.subtype === "short-let"
    ? t("wizard.details.perNightOrMo")
    : store.listingType === "rent"
    ? t("wizard.details.perMonth")
    : "";

  return (
    <View style={styles.stepFormBody}>
      {/* Price & Area Size Row */}
      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <View style={styles.formLabelRow}>
            <Text style={styles.formLabel}>
              {t("wizard.details.priceLabel", { suffix: priceSuffix })}
            </Text>
          </View>
          {/* Ticked, the box is locked and shows the words buyers will see; the typed
              price is kept underneath and comes back when the tick is removed. */}
          <TextInput
            accessibilityLabel={t("wizard.details.priceLabel", { suffix: priceSuffix })}
            accessibilityState={{ disabled: onRequest }}
            editable={!onRequest}
            keyboardType="numeric"
            onChangeText={(v) => store.setDetails({ price: v })}
            placeholder={
              onRequest
                ? priceOnRequestLabel(language)
                : store.subtype === "short-let"
                  ? t("wizard.details.pricePlaceholderShortLet")
                  : t("wizard.details.pricePlaceholderSale")
            }
            placeholderTextColor={onRequest ? "#5C6B66" : "#899790"}
            style={[styles.formInput, onRequest && styles.formInputLocked]}
            value={onRequest ? "" : store.price}
          />
          <Pressable
            accessibilityLabel={priceOnRequestLabel(language)}
            accessibilityHint={t("wizard.details.contactForPriceHint")}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: onRequest }}
            aria-checked={onRequest}
            onPress={() => store.setDetails({ priceOnRequest: !onRequest })}
            style={({ pressed }) => [styles.priceOnRequestRow, webPointer, pressed && styles.pressed]}
          >
            <View style={[styles.priceOnRequestBox, onRequest && styles.priceOnRequestBoxOn]}>
              {onRequest ? <Check color="#0B1A17" size={14} strokeWidth={3} /> : null}
            </View>
            <Text style={styles.priceOnRequestText}>{priceOnRequestLabel(language)}</Text>
          </Pressable>
          <Text style={styles.formHint}>{t("wizard.details.contactForPriceHint")}</Text>
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <View style={styles.formLabelRow}>
            <Text style={styles.formLabel}>{t("wizard.details.areaSizeLabel")}</Text>
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
                ? t("wizard.details.areaPlaceholderKatha")
                : t("wizard.details.areaPlaceholderSqft")
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
              <Text style={styles.formLabel}>{t("wizard.details.bedrooms")}</Text>
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
              <Text style={styles.formLabel}>{t("wizard.details.bathrooms")}</Text>
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
              <Text style={styles.formLabel}>{t("wizard.details.floorLevel")}</Text>
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
              <Text style={styles.formLabel}>{t("wizard.details.facingDirection")}</Text>
              <TextInput
                onChangeText={(v) => store.setDetails({ facing: v })}
                placeholder={t("wizard.details.facingPlaceholder")}
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
            {t("wizard.details.amenitiesLabel", { category: activeTypeConfig.label })}
          </Text>
          <Text style={styles.formHint}>{t("wizard.details.amenitiesHint")}</Text>
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
