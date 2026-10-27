import { Eye, EyeOff, KeyRound, X } from "@/components/icons";
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
import { useResponsive } from "@/hooks/useResponsive";
import { notify } from "@/lib/alert";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/services/apiClient";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";

export type ChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Shared Change Password Modal for both Buyer and Seller profiles.
 * Encapsulates password change state, form validation, error display, and API dispatch.
 */
export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const changePassword = useAuthStore((s) => s.changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleClose = () => {
    setPasswordError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);
    const validation = changePasswordSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirmPassword: confirmPassword,
    });
    if (!validation.success) {
      setPasswordError(
        validation.error.issues[0]?.message ||
          t("seller.changePassword.invalidDetails") ||
          t("userProfile.invalidPasswordDetails"),
      );
      return;
    }

    try {
      setIsChangingPassword(true);
      const success = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (success) {
        handleClose();
        notify(
          t("common.success") || t("seller.changePassword.successTitle"),
          t("userProfile.passwordChangeSuccess") || t("seller.changePassword.successMessage"),
        );
      } else {
        setPasswordError(t("seller.changePassword.failed") || "Failed to update password");
      }
    } catch (err: any) {
      setPasswordError(toApiError(err).message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={handleClose} style={styles.modalBackdrop}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalCard, isPhone && styles.modalCardPhone]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <KeyRound color="#03a675" size={20} />
            </View>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>
                {t("seller.changePassword.title") || t("userProfile.changePasswordModalTitle")}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t("seller.changePassword.subtitle") ||
                  t("userProfile.changePasswordModalSubtitle")}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={t("auth.close") || "Close"}
              hitSlop={10}
              onPress={handleClose}
              style={[styles.modalCloseBtn, webPointer]}
            >
              <X color="#0B1A17" size={18} />
            </Pressable>
          </View>

          {passwordError ? (
            <View style={styles.modalErrorBanner}>
              <Text style={styles.modalErrorText}>{passwordError}</Text>
            </View>
          ) : null}

          {/* Current Password */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalFieldLabel}>
              {t("seller.changePassword.currentPassword") ||
                t("userProfile.currentPasswordLabel")}
            </Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  setPasswordError(null);
                }}
                placeholder={
                  t("seller.changePassword.currentPasswordPlaceholder") ||
                  t("userProfile.currentPasswordPlaceholder")
                }
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showCurrentPassword}
                style={styles.modalTextInput}
                value={currentPassword}
              />
              <Pressable
                accessibilityLabel={
                  showCurrentPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={[styles.eyeBtn, webPointer]}
              >
                {showCurrentPassword ? (
                  <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                ) : (
                  <Eye color="rgba(11,26,23,0.5)" size={16} />
                )}
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
            <Text style={styles.modalFieldLabel}>
              {t("seller.changePassword.newPassword") ||
                t("userProfile.newPasswordLabel")}
            </Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setNewPassword(val);
                  setPasswordError(null);
                }}
                placeholder={
                  t("seller.changePassword.newPasswordPlaceholder") ||
                  t("userProfile.newPasswordPlaceholder")
                }
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showNewPassword}
                style={styles.modalTextInput}
                value={newPassword}
              />
              <Pressable
                accessibilityLabel={
                  showNewPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={[styles.eyeBtn, webPointer]}
              >
                {showNewPassword ? (
                  <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                ) : (
                  <Eye color="rgba(11,26,23,0.5)" size={16} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={[styles.modalInputGroup, { marginTop: 14 }]}>
            <Text style={styles.modalFieldLabel}>
              {t("seller.changePassword.confirmNewPassword") ||
                t("userProfile.confirmNewPasswordLabel")}
            </Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setPasswordError(null);
                }}
                placeholder={
                  t("seller.changePassword.confirmPasswordPlaceholder") ||
                  t("userProfile.confirmNewPasswordPlaceholder")
                }
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showConfirmPassword}
                style={styles.modalTextInput}
                value={confirmPassword}
              />
              <Pressable
                accessibilityLabel={
                  showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={[styles.eyeBtn, webPointer]}
              >
                {showConfirmPassword ? (
                  <EyeOff color="rgba(11,26,23,0.5)" size={16} />
                ) : (
                  <Eye color="rgba(11,26,23,0.5)" size={16} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActionRow}>
            <Pressable
              disabled={isChangingPassword}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.modalCancelBtn,
                webPointer,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalCancelBtnText}>
                {t("seller.changePassword.cancelBtn") || t("userProfile.cancel")}
              </Text>
            </Pressable>

            <Pressable
              disabled={isChangingPassword}
              onPress={handleChangePasswordSubmit}
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                webPointer,
                pressed && styles.pressed,
                isChangingPassword && styles.btnDisabled,
              ]}
            >
              {isChangingPassword ? (
                <ActivityIndicator color={colorTokens.onBrand} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>
                  {t("seller.changePassword.submitBtn") || t("userProfile.savePassword")}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 100,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 45px -10px rgba(11, 26, 23, 0.25)",
        }
      : {
          elevation: 10,
        }),
  },
  modalCardPhone: {
    padding: 18,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(4, 207, 146, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: "#0B1A17",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalErrorBanner: {
    backgroundColor: "#FFF5F6",
    borderWidth: 1,
    borderColor: "rgba(212, 24, 61, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  modalErrorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#D4183D",
  },
  modalInputGroup: {
    width: "100%",
  },
  modalFieldLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
    color: "#0B1A17",
    marginBottom: 6,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F5",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.06)",
  },
  modalTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  eyeBtn: {
    padding: 6,
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.medium,
    color: "#5C6B66",
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.semiBold,
    color: colorTokens.onBrand,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.85,
  },
});
