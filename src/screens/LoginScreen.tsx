import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Mail, Lock, UserPlus } from "lucide-react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { FloatingInput, ErrorBanner, AuthButton, Divider } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    const success = await login({ email: email.trim(), password });
    if (success) {
      router.replace("/profile");
    }
  };

  return (
    <AppChrome active="profile">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue exploring your local properties</Text>

          <ErrorBanner message={error} />

          <FloatingInput
            label="Email Address"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (error) clearError();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={Mail}
          />

          <FloatingInput
            label="Password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) clearError();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <AuthButton
            label="Log In"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            style={styles.submitBtn}
          />

          <Divider text="New to HomeNet?" />

          <AuthButton
            label="Create an Account"
            onPress={() => {
              clearError();
              router.push("/users?register=true" as any); // fallback mapping or register tab
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
