import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Lock, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/authStore";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/schemas/auth";
import { FormFloatingInput } from "@/components/FormFloatingInput";
import { ErrorBanner, AuthButton } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function ChangePasswordScreen() {
  const { changePassword, loading, error, clearError } = useAuthStore();

  const { control, handleSubmit, reset, formState: { isValid } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    const success = await changePassword({
      current_password: data.current_password,
      new_password: data.new_password,
    });

    if (success) {
      reset();
      router.replace("/profile" as never);
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Enter your current password and your new password</Text>

          <ErrorBanner message={error} />

          <FormFloatingInput
            control={control}
            name="current_password"
            label="Current Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FormFloatingInput
            control={control}
            name="new_password"
            label="New Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FormFloatingInput
            control={control}
            name="confirmPassword"
            label="Confirm New Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <AuthButton
            label="Update Password"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={!isValid}
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
