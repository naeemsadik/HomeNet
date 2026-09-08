import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { useAiFinderModalStore } from "@/stores/useAiFinderModalStore";
import { useResponsive } from "@/hooks/useResponsive";
import { AiFinderWorkflow } from "./AiFinderWorkflow";
import { shadow, webPointer } from "@/theme";

export function AiFinderModal() {
  const { visible, close } = useAiFinderModalStore();
  const { isPhone, width } = useResponsive();

  if (!visible) return null;

  // Ensure there is always ample room on the right for the floating close button on desktop
  const containerMaxWidth = isPhone ? "100%" : Math.min(width - 120, 940);

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        {/* Backdrop clickable area with blur effect */}
        <Pressable
          accessibilityLabel="Close AI search dialog"
          onPress={close}
          style={styles.backdrop}
        />

        {/* Dialog Container */}
        <View
          style={[
            styles.dialogContainer,
            { maxWidth: containerMaxWidth },
            isPhone && styles.dialogContainerPhone,
          ]}
        >
          {/* Floating Close Button positioned at the red mark (outside top-right) */}
          <Pressable
            accessibilityLabel="Close AI search dialog"
            accessibilityRole="button"
            onPress={close}
            style={({ pressed, hovered }: any) => [
              styles.floatingCloseButton,
              isPhone && styles.floatingCloseButtonPhone,
              hovered && styles.floatingCloseButtonHovered,
              pressed && styles.floatingCloseButtonPressed,
              webPointer,
            ]}
          >
            <X color="#FFFFFF" size={20} strokeWidth={2.4} />
          </Pressable>

          {/* Modal Dialog Card */}
          <View style={[styles.dialogCard, isPhone && styles.dialogCardPhone]}>
            <ScrollView
              contentContainerStyle={styles.dialogScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <AiFinderWorkflow isModal onClose={close} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    ...(Platform.OS === "web" ? {
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } : {}),
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11, 26, 23, 0.15)",
    ...(Platform.OS === "web" ? {
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } : {}),
  },
  dialogContainer: {
    position: "relative",
    width: "100%",
    maxHeight: "92%",
  },
  dialogContainerPhone: {
    maxHeight: "96%",
  },
  floatingCloseButton: {
    position: "absolute",
    top: 6,
    right: -46,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    ...(Platform.OS === "web" ? {
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      transition: "all 0.2s ease",
    } : {}),
  },
  floatingCloseButtonHovered: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.7)",
    transform: [{ scale: 1.1 }],
  },
  floatingCloseButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  floatingCloseButtonPhone: {
    top: -44,
    right: 4,
  },
  dialogCard: {
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    overflow: "hidden",
    zIndex: 10,
    ...shadow,
  },
  dialogCardPhone: {
    borderRadius: 18,
  },
  dialogScroll: {
    padding: 12,
  },
});
