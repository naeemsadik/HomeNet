import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Trash2, X } from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { notify } from "@/lib/alert";
import { toApiError } from "@/services/apiClient";
import { DELETE_ACCOUNT_CONFIRMATION, deleteMyAccount } from "@/services/userApi";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";

type DeleteAccountDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  deletedTitle: string;
  deletedMessage: string;
};

/**
 * Type-to-confirm dialog for deleting the signed-in user's own account.
 * Delete stays disabled until the input matches the phrase exactly; the
 * phrase is what the API checks, so it is never translated.
 */
export function DeleteAccountDialog({
  visible,
  onClose,
  title,
  message,
  confirmLabel,
  deletedTitle,
  deletedMessage,
}: DeleteAccountDialogProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const logout = useAuthStore((s) => s.logout);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const matches = typed === DELETE_ACCOUNT_CONFIRMATION;

  // Each opening starts empty, so the phrase is typed fresh every time.
  const reset = () => {
    setTyped("");
    setError(null);
  };

  const handleClose = () => {
    if (isDeleting) return;
    reset();
    onClose();
  };

  const handleDelete = async () => {
    if (!matches || isDeleting) return;
    setError(null);
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      reset();
      onClose();
      await logout();
      router.replace("/");
      notify(deletedTitle, deletedMessage);
    } catch (err) {
      const apiError = toApiError(err);
      // A failed token refresh clears the session and may not surface as a 401.
      const sessionGone = apiError.status === 401 || !useAuthStore.getState().user;
      if (sessionGone) {
        reset();
        onClose();
        await logout();
        notify(t("deleteAccountDialog.sessionExpiredTitle"), t("deleteAccountDialog.sessionExpiredMessage"));
        useAuthModalStore.getState().open();
      } else if (apiError.status === 400) {
        setError(t("deleteAccountDialog.phraseMismatch"));
      } else {
        setError(apiError.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={handleClose} transparent visible={visible}>
      <Pressable onPress={handleClose} style={styles.backdrop}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.card, isPhone && styles.cardPhone]}
        >
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Trash2 color={colorTokens.errorText} size={20} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <Pressable
              accessibilityLabel={t("deleteAccountDialog.closeAria")}
              disabled={isDeleting}
              hitSlop={10}
              onPress={handleClose}
              style={[styles.closeBtn, webPointer]}
            >
              <X color={colorTokens.ink} size={18} />
            </Pressable>
          </View>

          <Text style={styles.message}>{message}</Text>

          {error ? (
            <View accessibilityLiveRegion="polite" style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>{t("deleteAccountDialog.typeToConfirm")}</Text>
          <Text selectable style={styles.phrase}>{DELETE_ACCOUNT_CONFIRMATION}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel={t("deleteAccountDialog.inputLabel")}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!isDeleting}
              onChangeText={(val) => {
                setTyped(val);
                if (error) setError(null);
              }}
              onSubmitEditing={handleDelete}
              placeholder={DELETE_ACCOUNT_CONFIRMATION}
              placeholderTextColor={colorTokens.subtle}
              spellCheck={false}
              style={styles.input}
              value={typed}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              disabled={isDeleting}
              onPress={handleClose}
              style={({ pressed }) => [styles.cancelBtn, webPointer, pressed && styles.pressed]}
            >
              <Text style={styles.cancelBtnText}>{t("deleteAccountDialog.cancel")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !matches || isDeleting }}
              disabled={!matches || isDeleting}
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                matches && webPointer,
                (!matches || isDeleting) && styles.deleteBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator color={colorTokens.surface} size="small" />
              ) : (
                <Text style={styles.deleteBtnText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colorTokens.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 20px 45px -10px rgba(11, 26, 23, 0.25)" }
      : { elevation: 10 }),
  },
  cardPhone: {
    padding: 18,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colorTokens.errorSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
  },
  closeBtn: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: colorTokens.errorSurface,
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.errorText,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.body,
    marginBottom: 6,
  },
  phrase: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: colorTokens.errorText,
    backgroundColor: colorTokens.errorSurface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  inputWrap: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
    justifyContent: "center",
  },
  input: {
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colorTokens.ink,
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colorTokens.surfaceSunken,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: colorTokens.muted,
  },
  deleteBtn: {
    minWidth: 120,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colorTokens.errorText,
  },
  deleteBtnDisabled: {
    opacity: 0.45,
  },
  deleteBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
    color: colorTokens.surface,
  },
  pressed: {
    opacity: 0.85,
  },
});
