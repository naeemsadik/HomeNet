import { Eye, EyeOff, KeyRound, X } from "@/components/icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { notify } from "@/lib/alert";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/services/apiClient";
import { colorTokens, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { styles } from "../screens/SellerProfileScreen.styles";

const MIN_PASSWORD_LENGTH = 8;

type SellerChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

/** Change-password dialog for the seller profile. Owns its form state. */
export function SellerChangePasswordModal({ visible, onClose }: SellerChangePasswordModalProps) {
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

  // A stale error shouldn't greet the next opening.
  const handleClose = () => {
    setPasswordError(null);
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
      setPasswordError(validation.error.issues[0]?.message || t("seller.changePassword.invalidDetails"));
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
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        notify(t("seller.changePassword.successTitle"), t("seller.changePassword.successMessage"));
      } else {
        setPasswordError(t("seller.changePassword.failed"));
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
      <Pressable
        onPress={handleClose}
        style={styles.modalBackdrop}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalCard, isPhone && styles.modalCardPhone]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <KeyRound color="#5F3806" size={20} />
            </View>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>{t("seller.changePassword.title")}</Text>
              <Text style={styles.modalSubtitle}>
                {t("seller.changePassword.subtitle")}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={t("seller.changePassword.closeAria")}
              hitSlop={10}
              onPress={handleClose}
              style={[styles.modalCloseBtn, webPointer]}
            >
              <X color="#1A1612" size={18} />
            </Pressable>
          </View>

          {passwordError ? (
            <View style={styles.modalErrorBanner}>
              <Text style={styles.modalErrorText}>{passwordError}</Text>
            </View>
          ) : null}

          {/* Current Password */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalFieldLabel}>{t("seller.changePassword.currentPassword")}</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  setPasswordError(null);
                }}
                placeholder={t("seller.changePassword.currentPasswordPlaceholder")}
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showCurrentPassword}
                style={styles.modalTextInput}
                value={currentPassword}
              />
              <Pressable
                accessibilityLabel={t("seller.changePassword.toggleShowPassword")}
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
            <Text style={styles.modalFieldLabel}>{t("seller.changePassword.newPassword")}</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setNewPassword(val);
                  setPasswordError(null);
                }}
                placeholder={t("seller.changePassword.newPasswordPlaceholder")}
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showNewPassword}
                style={styles.modalTextInput}
                value={newPassword}
              />
              <Pressable
                accessibilityLabel={t("seller.changePassword.toggleShowPassword")}
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
            <Text style={styles.modalFieldLabel}>{t("seller.changePassword.confirmNewPassword")}</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setPasswordError(null);
                }}
                placeholder={t("seller.changePassword.confirmPasswordPlaceholder")}
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showConfirmPassword}
                style={styles.modalTextInput}
                value={confirmPassword}
              />
              <Pressable
                accessibilityLabel={t("seller.changePassword.toggleShowPassword")}
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
              onPress={handleClose}
              style={({ pressed }) => [
                styles.modalCancelBtn,
                webPointer,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalCancelBtnText}>{t("seller.changePassword.cancelBtn")}</Text>
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
                <Text style={styles.modalSubmitBtnText}>{t("seller.changePassword.submitBtn")}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
