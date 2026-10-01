import { Eye, EyeOff, KeyRound, X } from "@/components/icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { notify } from "@/lib/alert";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, webPointer } from "@/theme";
import { styles } from "../screens/SellerProfileScreen.styles";

const MIN_PASSWORD_LENGTH = 8;

type SellerChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

/** Change-password dialog for the seller profile. Owns its form state. */
export function SellerChangePasswordModal({ visible, onClose }: SellerChangePasswordModalProps) {
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
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
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
        notify("Success", "Your password has been changed successfully.");
      } else {
        setPasswordError("Failed to change password. Please check your current password.");
      }
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
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
              <KeyRound color="#03a675" size={20} />
            </View>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your current password and a new secure password.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
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
            <Text style={styles.modalFieldLabel}>Current password</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  setPasswordError(null);
                }}
                placeholder="Enter current password"
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showCurrentPassword}
                style={styles.modalTextInput}
                value={currentPassword}
              />
              <Pressable
                accessibilityLabel="Toggle show password"
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
            <Text style={styles.modalFieldLabel}>New password</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setNewPassword(val);
                  setPasswordError(null);
                }}
                placeholder="At least 6 characters"
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showNewPassword}
                style={styles.modalTextInput}
                value={newPassword}
              />
              <Pressable
                accessibilityLabel="Toggle show password"
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
            <Text style={styles.modalFieldLabel}>Confirm new password</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                autoCapitalize="none"
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setPasswordError(null);
                }}
                placeholder="Re-enter new password"
                placeholderTextColor="rgba(11,26,23,0.35)"
                secureTextEntry={!showConfirmPassword}
                style={styles.modalTextInput}
                value={confirmPassword}
              />
              <Pressable
                accessibilityLabel="Toggle show password"
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
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
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
                <Text style={styles.modalSubmitBtnText}>Update password</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
