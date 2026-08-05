import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Trash2, X } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useMediaDelete } from "../hooks/useMediaDelete";

interface MediaDeleteButtonProps {
  mediaId: string;
  propertyId?: string;
  onSuccess: (mediaId: string) => void;
  onError?: (error: unknown) => void;
}

export function MediaDeleteButton({ mediaId, onSuccess, onError }: MediaDeleteButtonProps) {
  const { deleteMedia, deleting } = useMediaDelete();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (confirmVisible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
    } else {
      scale.setValue(0.9);
    }
  }, [confirmVisible, scale]);

  async function handleConfirm() {
    const result = await deleteMedia(mediaId);
    setConfirmVisible(false);
    if (result.success) {
      onSuccess(mediaId);
    } else {
      onError?.(result.error);
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setConfirmVisible(true)}
        style={styles.deleteBtn}
        accessibilityLabel="Delete image"
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color={colorTokens.textInverse} size="small" />
        ) : (
          <X color={colorTokens.textInverse} size={14} />
        )}
      </Pressable>

      <Modal animationType="fade" transparent visible={confirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.dialog, { transform: [{ scale }] }]}>
            <View style={styles.iconWrap}>
              <AlertTriangle color={colorTokens.error} size={22} />
            </View>
            <Text style={styles.title}>Delete Image</Text>
            <Text style={styles.message}>
              Are you sure you want to delete this image? This action cannot be undone.
            </Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={styles.cancelBtn}
                accessibilityLabel="Cancel"
                disabled={deleting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.confirmBtn, deleting && { opacity: 0.5 }]}
                accessibilityLabel="Confirm delete"
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color={colorTokens.textInverse} size="small" />
                ) : (
                  <Trash2 color={colorTokens.textInverse} size={14} />
                )}
                <Text style={styles.confirmText}>{deleting ? "Deleting..." : "Delete"}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.error,
    zIndex: 20,
    shadowColor: colorTokens.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.overlay,
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    padding: 24,
    borderRadius: 18,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.errorLight,
  },
  title: {
    fontSize: 16,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  cancelText: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 10,
    backgroundColor: colorTokens.error,
  },
  confirmText: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
  },
});
