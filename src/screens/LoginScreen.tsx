import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Mail, Lock, UserPlus } from "lucide-react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { FormFloatingInput } from "@/components/FormFloatingInput";
import { ErrorBanner, AuthButton, Divider } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();

  const { control, handleSubmit, formState: { isValid } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    const success = await login({ email: data.email.trim(), password: data.password });
    if (success) {
      router.replace("/profile" as never);
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue exploring your local properties</Text>

          <ErrorBanner message={error} />

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

          <AuthButton
            label="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={!isValid}
            style={styles.submitBtn}
          />

          <Divider text="New to HomeNet?" />

          <AuthButton
            label="Create an Account"
            onPress={() => {
              clearError();
              router.push("/users?register=true" as any);
            }}
            variant="secondary"
            icon={UserPlus}
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
