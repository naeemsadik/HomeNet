import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OverlayModal } from "@/components/OverlayModal";
import { X } from "@/components/icons";
import { useResponsive, useWindowSize } from "@/hooks/useResponsive";
import { colorTokens, fonts, radius, webPointer } from "@/theme";

/**
 * A panel over the page: a bottom sheet on phones, a centred dialog on wider
 * screens. Built on OverlayModal so it opens inside another modal on Android.
 */
export function MessSheet({
  visible,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  width = 560,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Dialog width on wide screens. */
  width?: number;
}) {
  const { isPhone } = useResponsive();
  const { height } = useWindowSize();

  return (
    <OverlayModal visible={visible} onRequestClose={onClose} animationType={isPhone ? "slide" : "fade"}>
      <View style={[styles.layer, isPhone ? styles.layerPhone : styles.layerWide]}>
        <Pressable accessibilityLabel={closeLabel} accessibilityRole="button" onPress={onClose} style={styles.scrim} />
        <View
          accessibilityViewIsModal
          aria-label={title}
          role="dialog"
          style={[
            styles.panel,
            isPhone ? styles.panelPhone : [styles.panelWide, { width }],
            { maxHeight: Math.round(height * (isPhone ? 0.9 : 0.85)) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header" aria-level={2} numberOfLines={2}>
              {title}
            </Text>
            <Pressable accessibilityLabel={closeLabel} accessibilityRole="button" hitSlop={8} onPress={onClose} style={[styles.close, webPointer]}>
              <X size={20} color={colorTokens.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </OverlayModal>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1 },
  layerPhone: { justifyContent: "flex-end" },
  layerWide: { justifyContent: "center", alignItems: "center", padding: 24 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(11, 26, 23, 0.45)" },
  panel: { backgroundColor: colorTokens.surface, overflow: "hidden" },
  panelPhone: { width: "100%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  panelWide: { maxWidth: "100%", borderRadius: radius.xl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  title: { flex: 1, fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 24, color: colorTokens.ink },
  close: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  body: { padding: 20, gap: 20 },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
});
