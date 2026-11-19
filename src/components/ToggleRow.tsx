import { StyleSheet, Switch, Text, View } from "react-native";
import { colorTokens, fonts } from "@/theme";

/** A labelled on/off switch, with an optional line saying what each position does. */
export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        thumbColor={colorTokens.surface}
        trackColor={{ false: colorTokens.divider, true: colorTokens.brand }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.ink },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
});
