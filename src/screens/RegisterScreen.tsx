import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Mail, Lock, User, LogIn } from "lucide-react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/authStore";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { FormFloatingInput } from "@/components/FormFloatingInput";
import { ErrorBanner, AuthButton, Divider } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function RegisterScreen() {
  const { register, loading, error, clearError } = useAuthStore();

  const { control, handleSubmit, formState: { isValid } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    const success = await register({
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    if (success) {
      router.replace("/profile" as never);
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Join HomeNet</Text>
          <Text style={styles.subtitle}>Create an account to save properties and get expert valuations</Text>

          <ErrorBanner message={error} />

          <FormFloatingInput
            control={control}
            name="full_name"
            label="Full Name"
            autoCapitalize="words"
            icon={User}
          />

          <FormFloatingInput
            control={control}
            name="email"
            label="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={Mail}
          />

          <FormFloatingInput
            control={control}
            name="password"
            label="Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FormFloatingInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <AuthButton
            label="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={!isValid}
            style={styles.submitBtn}
          />

          <Divider text="Already have an account?" />

          <AuthButton
            label="Log In instead"
            onPress={() => {
              clearError();
              router.push("/profile" as never);
            }}
            variant="secondary"
            icon={LogIn}
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
    fontSize: 26,
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
});
