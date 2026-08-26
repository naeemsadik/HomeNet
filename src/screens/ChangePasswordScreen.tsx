import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Lock, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { FloatingInput, ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function ChangePasswordScreen() {
  const { changePassword, loading, error, clearError } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setLocalError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("New passwords do not match");
      return;
    }

    const success = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/profile" as never);
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Enter your current password and your new password</Text>

          <ErrorBanner message={localError || error} />

          <FloatingInput
            label="Current Password"
            value={currentPassword}
            onChangeText={(val) => {
              setCurrentPassword(val);
              setLocalError(null);
              if (error) clearError();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FloatingInput
            label="New Password"
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              setLocalError(null);
              if (error) clearError();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FloatingInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              setLocalError(null);
              if (error) clearError();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <AuthButton
            label="Update Password"
            onPress={handleChangePassword}
            loading={loading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            style={styles.submitBtn}
          />

          <AuthButton
            label="Back to Profile"
            onPress={() => {
              clearError();
              router.back();
            }}
            variant="ghost"
            icon={ArrowLeft}
            style={styles.backBtn}
          />
        </View>
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.ink,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 28,
  },
  submitBtn: {
    marginTop: 8,
  },
  backBtn: {
    marginTop: 12,
  },
});
