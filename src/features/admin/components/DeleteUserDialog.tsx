import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Trash2 } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

interface DeleteUserDialogProps {
  visible: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteUserDialog({
  visible,
  userName,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteUserDialogProps) {
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
    } else {
      scale.setValue(0.9);
    }
  }, [visible, scale]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.dialog, { transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <AlertTriangle color={colorTokens.error} size={24} />
          </View>
          <Text style={styles.title}>Delete User</Text>
          <Text style={styles.message}>
            Are you sure you want to delete <Text style={styles.nameHighlight}>{userName}</Text>?
            This will permanently remove the user and all associated data. This action cannot be undone.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={styles.cancelBtn}
              accessibilityLabel="Cancel"
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.confirmBtn, loading && styles.confirmDisabled]}
              accessibilityLabel="Delete user permanently"
              disabled={loading}
            >
              <Trash2 color={colorTokens.textInverse} size={14} />
              <Text style={styles.confirmText}>
                {loading ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.overlay,
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.errorLight,
  },
  title: {
    fontSize: 17,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  nameHighlight: {
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: colorTokens.error,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
});
