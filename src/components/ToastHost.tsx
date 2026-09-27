import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "@/lib/toast";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

/** Renders the current toast. Mounted once, in the root layout. */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 24 }]}>
      <View
        accessibilityLiveRegion="polite"
        key={toast.id}
        // Web: role="status" makes screen readers announce the message politely.
        role="status"
        style={styles.toast}
      >
        <Text style={styles.message}>{toast.message}</Text>
        {toast.action ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.action?.onPress();
              dismiss();
            }}
            style={[styles.action, webPointer]}
          >
            <Text style={styles.actionText}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: Platform.OS === "web" ? ("fixed" as "absolute") : "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10000,
  },
  toast: {
    maxWidth: 520,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colorTokens.ink,
  },
  message: {
    flexShrink: 1,
    color: colorTokens.onInk,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    paddingVertical: 4,
  },
  actionText: {
    // The brand fill on ink measures 8.8:1, so it is text-safe here.
    color: colorTokens.brand,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
