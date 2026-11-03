import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { goToPostAuthDestination } from "@/lib/postAuth";
import { colorTokens } from "@/theme";
import { useTranslation } from "@/i18n";
import { AuthCard } from "./AuthCard";

export function AuthModal() {
  const { visible, close, onSuccess } = useAuthModalStore();
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={modalStyles.overlay}>
        <Pressable
          style={modalStyles.backdrop}
          onPress={close}
          accessibilityLabel={t("auth.close")}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={modalStyles.keyboardWrap}
        >
          <AuthCard
            initialMode="signin"
            isModal
            onClose={close}
            onSuccess={() => {
              close();
              if (onSuccess) onSuccess();
              else goToPostAuthDestination();
            }}
            showClose
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
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
  keyboardWrap: {
    width: "100%",
    maxWidth: 448,
    maxHeight: "96%",
    alignItems: "center",
    justifyContent: "center",
  },
});
