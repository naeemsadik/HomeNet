import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { fonts, webPointer } from "@/theme";

export type AuthMode = "signin" | "signup";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function FacebookIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function LoginModal({
  visible,
  onClose,
  initialMode = "signin",
  onSuccess,
}: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, register, loading, error: storeError, clearError } = useAuthStore();

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setFormError(null);
    clearError();
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!email.trim()) {
      setFormError("Please enter your email address");
      return;
    }
    if (!password) {
      setFormError("Please enter your password");
      return;
    }

    if (mode === "signin") {
      const ok = await login({ email: email.trim(), password });
      if (ok) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } else {
      if (!fullName.trim()) {
        setFormError("Please enter your full name");
        return;
      }
      const ok = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      if (ok) {
        onClose();
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Top Gradient Header */}
          <LinearGradient
            colors={["#0F6D55", "#2251D6"]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.gradientHeader}
          >
            {/* Close Button */}
            <Pressable
              accessibilityLabel="Close authentication modal"
              onPress={onClose}
              style={[styles.closeButton, webPointer]}
            >
              <X color="#0B1A17" size={18} />
            </Pressable>

            {/* Center Logo Icon Box */}
            <View style={styles.logoIconBox}>
              <Home color="#FFFFFF" size={36} strokeWidth={2} />
            </View>

            {/* App Title */}
            <Text style={styles.brandTitle}>Homenet</Text>

            {/* Subtitle */}
            <Text style={styles.brandSubtitle}>
              Bangladesh's AI property marketplace
            </Text>
          </LinearGradient>

          {/* Mode Switcher Tabs (Sign In / Create Account) */}
          <View style={styles.tabSwitcher}>
            <Pressable
              onPress={() => handleTabSwitch("signin")}
              style={[
                styles.tabItem,
                mode === "signin" && styles.tabItemActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signin" && styles.tabTextActive,
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleTabSwitch("signup")}
              style={[
                styles.tabItem,
                mode === "signup" && styles.tabItemActive,
                webPointer,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signup" && styles.tabTextActive,
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Social Logins */}
            <View style={styles.socialButtonsRow}>
              <Pressable style={[styles.googleButton, webPointer]}>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>Google</Text>
              </Pressable>

              <Pressable style={[styles.facebookButton, webPointer]}>
                <FacebookIcon />
                <Text style={styles.facebookButtonText}>Facebook</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Error Message */}
            {formError || storeError ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorText}>
                  {formError || storeError}
                </Text>
              </View>
            ) : null}

            {/* Form Inputs */}
            <View style={styles.formContainer}>
              {mode === "signup" ? (
                <View style={styles.inputWrap}>
                  <User color="#5C6B66" size={16} style={styles.inputLeftIcon} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setFullName}
                    placeholder="Full name"
                    placeholderTextColor="rgba(11, 26, 23, 0.5)"
                    style={styles.textInput}
                    value={fullName}
                  />
                </View>
              ) : null}

              <View style={styles.inputWrap}>
                <Mail color="#5C6B66" size={16} style={styles.inputLeftIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="rgba(11, 26, 23, 0.5)"
                  style={styles.textInput}
                  value={email}
                />
              </View>

              <View style={styles.inputWrap}>
                <Lock color="#5C6B66" size={16} style={styles.inputLeftIcon} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  placeholder={mode === "signin" ? "Password" : "Create password"}
                  placeholderTextColor="rgba(11, 26, 23, 0.5)"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                  value={password}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.inputRightAction}
                >
                  {showPassword ? (
                    <EyeOff color="#5C6B66" size={16} />
                  ) : (
                    <Eye color="#5C6B66" size={16} />
                  )}
                </Pressable>
              </View>

              {mode === "signin" ? (
                <View style={styles.forgotPasswordRow}>
                  <Pressable style={webPointer}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                disabled={loading}
                onPress={handleSubmit}
                style={[styles.submitButton, loading && { opacity: 0.7 }, webPointer]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={16} />
                  </>
                )}
              </Pressable>
            </View>

            {/* Bottom Switch Link */}
            <View style={styles.bottomSwitchRow}>
              <Text style={styles.switchPromptText}>
                {mode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <Pressable
                onPress={() =>
                  handleTabSwitch(mode === "signin" ? "signup" : "signin")
                }
                style={webPointer}
              >
                <Text style={styles.switchActionText}>
                  {mode === "signin" ? "Sign up free" : "Sign In"}
                </Text>
              </Pressable>
            </View>

            {/* Green Promotion Value Card */}
            <View style={styles.promoCard}>
              <Sparkles color="#0F6D55" size={16} style={{ marginTop: 2 }} />
              <Text style={styles.promoText}>
                Join 240,000+ users getting AI-powered property insights tailored
                to your searches.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalCard: {
    width: "100%",
    maxWidth: 448,
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 12,
  },
  gradientHeader: {
    width: "100%",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconBox: {
    width: 67.4,
    height: 67.4,
    borderRadius: 14,
    backgroundColor: "rgba(15, 109, 85, 0.59)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    textAlign: "center",
  },
  brandSubtitle: {
    marginTop: 4,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  tabSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    height: 50.4,
    borderBottomWidth: 1.2,
    borderBottomColor: "rgba(11, 26, 23, 0.08)",
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1.2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#0F6D55",
  },
  tabText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#0F6D55",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 16,
  },
  socialButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  googleButton: {
    flex: 1,
    height: 42.4,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  googleButtonText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  facebookButton: {
    flex: 1,
    height: 42.4,
    borderRadius: 20,
    backgroundColor: "#1877F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  facebookButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(11, 26, 23, 0.08)",
  },
  dividerText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: "#DC2626",
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
    width: "100%",
  },
  inputWrap: {
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 20,
    height: 46.4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  inputRightAction: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#0B1A17",
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 0,
    outlineStyle: "none",
  } as any,
  forgotPasswordRow: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#0F6D55",
    height: 44,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "700",
  },
  bottomSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  switchPromptText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  switchActionText: {
    color: "#0F6D55",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
  },
  promoCard: {
    backgroundColor: "#E7F2EE",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  promoText: {
    flex: 1,
    color: "#0F6D55",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
