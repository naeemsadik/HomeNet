import { MapPin } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

/** Step 3: area, address and coordinates. */
export function WizardLocationStep({ onOpenAreaPicker }: { onOpenAreaPicker: () => void }) {
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Property address</Text>
        <TextInput
          onChangeText={(v) => store.setLocation({ address: v })}
          placeholder="e.g. House 12, Road 45, Gulshan 2"
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.address}
        />
      </View>

      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Area / Neighbourhood</Text>
          <Pressable
            onPress={onOpenAreaPicker}
            style={({ pressed }) => [styles.formInput, styles.areaPickerButton, pressed && styles.pressed]}
          >
            <MapPin color="#04cf92" size={17} />
            <Text style={[styles.areaPickerText, !store.areaId && styles.areaPickerPlaceholder]}>
              {store.areaId
                ? [store.areaName, store.district].filter(Boolean).join(", ")
                : "Select an area from the API"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Latitude</Text>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) =>
              store.setLocation({ locationLat: value.trim() === "" ? null : Number(value) })
            }
            placeholder="23.8103"
            placeholderTextColor="#899790"
            style={styles.formInput}
            value={store.locationLat === null ? "" : String(store.locationLat)}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Longitude</Text>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) =>
              store.setLocation({ locationLng: value.trim() === "" ? null : Number(value) })
            }
            placeholder="90.4125"
            placeholderTextColor="#899790"
            style={styles.formInput}
            value={store.locationLng === null ? "" : String(store.locationLng)}
          />
        </View>
      </View>
    </View>
  );
}
