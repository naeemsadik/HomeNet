import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { AuthCard, AuthMode } from "./AuthCard";

export { AuthMode };

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export function LoginModal({
  visible,
  onClose,
  initialMode = "signin",
  onSuccess,
}: LoginModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <AuthCard
          initialMode={initialMode}
          isModal
          onClose={onClose}
          onSuccess={onSuccess}
          showClose
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  backdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
