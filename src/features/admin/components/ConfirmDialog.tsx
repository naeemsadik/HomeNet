import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Trash2, type LucideIcon } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon: Icon,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
    } else {
      scale.setValue(0.9);
    }
  }, [visible, scale]);

  const iconColor = variant === "danger" ? colorTokens.error : colorTokens.warning;
  const iconBg = variant === "danger" ? colorTokens.errorLight : colorTokens.warningLight;
  const IconComponent = Icon ?? (variant === "danger" ? Trash2 : AlertTriangle);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.dialog, { transform: [{ scale }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <IconComponent color={iconColor} size={24} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={styles.cancelBtn}
              accessibilityLabel={cancelLabel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.confirmBtn, variant === "danger" ? styles.confirmDanger : styles.confirmWarning, loading && styles.confirmDisabled]}
              accessibilityLabel={confirmLabel}
              disabled={loading}
            >
              <Text style={[styles.confirmText, variant === "danger" ? styles.confirmTextDanger : styles.confirmTextWarning]}>
                {loading ? "Processing..." : confirmLabel}
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  confirmDanger: {
    backgroundColor: colorTokens.error,
  },
  confirmWarning: {
    backgroundColor: colorTokens.warning,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
  },
  confirmTextDanger: {
    color: colorTokens.textInverse,
  },
  confirmTextWarning: {
    color: colorTokens.textInverse,
  },
});
