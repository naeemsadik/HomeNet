import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { AuthCard } from "./AuthCard";

export function AuthModal() {
  const { visible, close, onSuccess } = useAuthModalStore();

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={close} />
        <AuthCard
          initialMode="signin"
          isModal
          onClose={close}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
          showClose
        />
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
