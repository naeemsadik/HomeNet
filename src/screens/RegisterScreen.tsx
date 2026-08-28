import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Mail, Lock, User, LogIn } from "lucide-react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { FloatingInput, ErrorBanner, AuthButton, Divider } from "@/components/AuthFormFields";
import { AppChrome } from "@/components/AppChrome";
import { colors, fonts } from "@/theme";

export function RegisterScreen() {
  const { register, loading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    const success = await register({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
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

          <ErrorBanner message={localError || error} />

          <FloatingInput
            label="Full Name"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              setLocalError(null);
              if (error) clearError();
            }}
            autoCapitalize="words"
            icon={User}
          />

          <FloatingInput
            label="Email Address"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setLocalError(null);
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
              setLocalError(null);
              if (error) clearError();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            icon={Lock}
          />

          <FloatingInput
            label="Confirm Password"
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
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={!fullName || !email || !password || !confirmPassword}
            style={styles.submitBtn}
          />

          <Divider text="Already have an account?" />

          <AuthButton
            label="Log In instead"
            onPress={() => {
              clearError();
              router.push("/profile" as never); // goes to login if not authenticated
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
