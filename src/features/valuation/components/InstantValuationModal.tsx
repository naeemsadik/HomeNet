import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { X } from "@/components/icons";
import { colorTokens, shadow, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useInstantValuationModalStore } from "../stores/useInstantValuationModalStore";
import { useInstantValuationStore } from "../stores/useInstantValuationStore";
import { InstantValuationWizard } from "./InstantValuationWizard";

export function InstantValuationModal() {
  const { visible, close, initialArea, initialPurpose, initialType } =
    useInstantValuationModalStore();
  const setInitialFromHero = useInstantValuationStore((s) => s.setInitialFromHero);
  const { isPhone, width } = useResponsive();

  useEffect(() => {
    if (visible && (initialArea || initialPurpose || initialType)) {
      setInitialFromHero({
        areaName: initialArea,
        purpose: initialPurpose,
        propertyType: initialType,
      });
    }
  }, [visible, initialArea, initialPurpose, initialType, setInitialFromHero]);

  if (!visible) return null;

  const containerMaxWidth = isPhone ? "100%" : Math.min(width - 80, 920);

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close valuation dialog"
          onPress={close}
          style={styles.backdrop}
        />

        <View
          style={[
            styles.dialogContainer,
            { maxWidth: containerMaxWidth },
            isPhone && styles.dialogContainerPhone,
          ]}
        >
          {/* Floating Close Button */}
          <Pressable
            accessibilityLabel="Close valuation dialog"
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
          >
            <InstantValuationWizard />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogContainer: {
    width: "100%",
    maxHeight: "92%",
    position: "relative",
  },
  dialogContainerPhone: {
    maxHeight: "98%",
    padding: 0,
  },
  scrollArea: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  floatingCloseButton: {
    position: "absolute",
    top: -12,
    right: -12,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colorTokens.ink,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  floatingCloseButtonPhone: {
    top: 8,
    right: 8,
    backgroundColor: "rgba(11, 26, 23, 0.75)",
  },
  floatingCloseButtonHovered: {
    backgroundColor: colorTokens.brandText,
  },
  floatingCloseButtonPressed: {
    opacity: 0.85,
  },
});
