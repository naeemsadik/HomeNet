import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { fonts, webPointer } from "@/theme";

const authBuildingImage = require("../../assets/auth-hero-building.png");

export type AuthMode = "signin" | "signup";

export interface AuthCardProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Figma Node 282:7 House Icon (size: 37.427px)
 */
function HomenetHouseIcon() {
  return (
    <Svg width={38} height={38} viewBox="0 0 38 38" fill="none">
      <Path
        d="M23.3916 32.7482V20.2727C23.3916 19.8591 23.2273 19.4625 22.9348 19.17C22.6424 18.8776 22.2457 18.7133 21.8321 18.7133H15.5944C15.1808 18.7133 14.7841 18.8776 14.4917 19.17C14.1992 19.4625 14.0349 19.8591 14.0349 20.2727V32.7482"
        stroke="#FFFFFF"
        strokeWidth={3.11888}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.67831 15.5944C4.6782 15.1407 4.77708 14.6924 4.96804 14.2809C5.159 13.8693 5.43744 13.5044 5.78395 13.2116L16.7 3.85649C17.263 3.38071 17.9762 3.11968 18.7133 3.11968C19.4503 3.11968 20.1636 3.38071 20.7265 3.85649L31.6426 13.2116C31.9891 13.5044 32.2675 13.8693 32.4585 14.2809C32.6494 14.6924 32.7483 15.1407 32.7482 15.5944V29.6293C32.7482 30.4565 32.4196 31.2498 31.8347 31.8347C31.2498 32.4196 30.4565 32.7482 29.6293 32.7482H7.79719C6.97001 32.7482 6.17671 32.4196 5.59181 31.8347C5.00691 32.4196 4.67831 30.4565 4.67831 29.6293V15.5944Z"
        stroke="#FFFFFF"
        strokeWidth={3.11888}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Figma Node 282:21 Google Icon
 */
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

/**
 * Figma Node 282:28 Facebook Icon
 */
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

/**
 * Figma Node 282:73 Sparkle Icon
 */
function FigmaSparkleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="authSparkleClip">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
      <Path
        d="M6.62467 10.3333C6.56515 10.1026 6.44489 9.89207 6.27641 9.72359C6.10793 9.55511 5.89738 9.43485 5.66667 9.37533L1.57667 8.32067C1.50689 8.30086 1.44547 8.25883 1.40174 8.20096C1.35801 8.14309 1.33435 8.07254 1.33435 8C1.33435 7.92746 1.35801 7.85691 1.40174 7.79904C1.44547 7.74117 1.50689 7.69914 1.57667 7.67933L5.66667 6.624C5.8973 6.56454 6.10779 6.44438 6.27627 6.27603C6.44474 6.10767 6.56504 5.89726 6.62467 5.66667L7.67933 1.57667C7.69894 1.50661 7.74092 1.44489 7.79888 1.40093C7.85684 1.35696 7.92759 1.33317 8.00033 1.33317C8.07308 1.33317 8.14383 1.35696 8.20179 1.40093C8.25974 1.44489 8.30173 1.50661 8.32133 1.57667L9.37533 5.66667C9.43485 5.89738 9.55511 6.10793 9.72359 6.27641C9.89207 6.44489 10.1026 6.56515 10.3333 6.62467L14.4233 7.67867C14.4937 7.69807 14.5557 7.74001 14.5999 7.79805C14.6441 7.8561 14.668 7.92704 14.668 8C14.668 8.07296 14.6441 8.1439 14.5999 8.20195C14.5557 8.25999 14.4937 8.30193 14.4233 8.32133L10.3333 9.37533C10.1026 9.43485 9.89207 9.55511 9.72359 9.72359C9.55511 9.89207 9.43485 10.1026 9.37533 10.3333L8.32067 14.4233C8.30106 14.4934 8.25908 14.5551 8.20112 14.5991C8.14316 14.643 8.07241 14.6668 7.99967 14.6668C7.92692 14.6668 7.85617 14.643 7.79821 14.5991C7.74026 14.5551 7.69827 14.4934 7.67867 14.4233L6.62467 10.3333Z"
        stroke="#04cf92"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3333 2V4.66667"
        stroke="#04cf92"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.6667 3.33333H12"
        stroke="#04cf92"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.66667 11.3333V12.6667"
        stroke="#04cf92"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.33333 12H2"
        stroke="#04cf92"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AuthCard({
  initialMode = "signin",
  onSuccess,
  showClose = false,
  onClose,
  isModal = false,
  style,
}: AuthCardProps) {
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

  const handleSocialClick = (provider: string) => {
    Alert.alert(provider, `${provider} sign-in will be available soon.`);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact support@homenet.com or use account security settings to reset your password."
    );
  };

  const handleSubmit = async () => {
    setFormError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError("Please enter your email address");
      return;
    }

    if (!password) {
      setFormError("Please enter your password");
      return;
    }

    if (mode === "signin") {
      const ok = await login({ email: cleanEmail, password });
      if (ok) {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }
    } else {
      const cleanName = fullName.trim();
      if (!cleanName) {
        setFormError("Please enter your full name");
        return;
      }
      if (cleanName.length < 2) {
        setFormError("Full name must be at least 2 characters");
        return;
      }
      if (password.length < 8) {
        setFormError("Password must be at least 8 characters");
        return;
      }

      const ok = await register({
        full_name: cleanName,
        email: cleanEmail,
        password,
      });
      if (ok) {
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }
    }
  };

  const ContentWrapper = isModal ? ScrollView : View;
  const contentWrapperProps = isModal
    ? {
        contentContainerStyle: styles.scrollContent,
        keyboardShouldPersistTaps: "handled" as const,
        showsVerticalScrollIndicator: false,
      }
    : {
        style: styles.scrollContent,
      };

  return (
    <View style={[styles.card, isModal && styles.modalCard, style]} testID="auth-card-container">
      {/* ─── Top Header with Building Image and Figma Gradient (Node 282:5) ─── */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={authBuildingImage}
          style={styles.headerImageBg}
          resizeMode="cover"
        >
          {/* Exact Figma Gradient Overlay (linear-gradient: 158.18deg) */}
          <LinearGradient
            colors={["rgb(15, 109, 85)", "rgba(15, 109, 85, 0.535)", "rgba(191, 255, 239, 0.36)"]}
            locations={[0, 0.572, 1]}
            start={{ x: 0.18, y: 0 }}
            end={{ x: 0.82, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Optional Close Button (Node 282:81) */}
            {showClose && onClose ? (
              <Pressable
                accessibilityLabel="Close"
                onPress={onClose}
                style={[styles.closeButton, webPointer]}
              >
                <X color="#0B1A17" size={18} strokeWidth={2.2} />
              </Pressable>
            ) : null}

            {/* Center Logo Icon Tile (Node 282:6 - 67.37px x 67.37px) */}
            <View style={styles.logoIconTile}>
              <HomenetHouseIcon />
            </View>

            {/* App Title (Node 282:10) */}
            <Text style={styles.brandTitle}>Homenet</Text>

            {/* Subtitle (Node 282:12) */}
            <Text style={styles.brandSubtitle}>
              Bangladesh's AI property marketplace
            </Text>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* ─── Mode Switcher Tabs (Node 282:13 - 50.4px height) ─── */}
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

      {/* ─── Form Body (Node 282:18 - px: 32px, py: 24px) ─── */}
      <ContentWrapper {...(contentWrapperProps as any)}>
        {/* Social Buttons (Node 282:19 - 42.4px height, gap: 12px) */}
        <View style={styles.socialButtonsRow}>
          <Pressable
            onPress={() => handleSocialClick("Google")}
            style={[styles.googleButton, webPointer]}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Google</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSocialClick("Facebook")}
            style={[styles.facebookButton, webPointer]}
          >
            <FacebookIcon />
            <Text style={styles.facebookButtonText}>Facebook</Text>
          </Pressable>
        </View>

        {/* Divider (Node 282:31) */}
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

        {/* Form Inputs (Node 282:37) */}
        <View style={styles.formContainer}>
          {mode === "signup" ? (
            <View style={styles.inputWrap}>
              <User color="#5C6B66" size={16} style={styles.inputLeftIcon} />
              <TextInput
                autoCapitalize="words"
                onChangeText={(val) => {
                  setFullName(val);
                  if (formError) setFormError(null);
                  if (storeError) clearError();
                }}
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
              onChangeText={(val) => {
                setEmail(val);
                if (formError) setFormError(null);
                if (storeError) clearError();
              }}
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
              onChangeText={(val) => {
                setPassword(val);
                if (formError) setFormError(null);
                if (storeError) clearError();
              }}
              placeholder={mode === "signin" ? "Password" : "Create password"}
              placeholderTextColor="rgba(11, 26, 23, 0.5)"
              secureTextEntry={!showPassword}
              style={styles.textInput}
              value={password}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.inputRightAction}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
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
              <Pressable onPress={handleForgotPassword} style={webPointer}>
                <Text style={styles.forgotPasswordText}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Submit Button (Node 282:60 - 44px height, rounded 20px) */}
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
                <ArrowRight color="#FFFFFF" size={16} strokeWidth={2.2} />
              </>
            )}
          </Pressable>
        </View>

        {/* Bottom Switch Link (Node 282:65) */}
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

        {/* AI Promotional Insights Card (Node 282:70) */}
        <View style={styles.promoCard}>
          <View style={styles.promoIconWrap}>
            <FigmaSparkleIcon />
          </View>
          <Text style={styles.promoText}>
            Join 240,000+ users getting AI-powered property insights tailored
            to your searches.
          </Text>
        </View>
      </ContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 448,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 12,
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  modalCard: {
    maxHeight: "96%",
  },
  headerContainer: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  headerImageBg: {
    width: "100%",
  },
  headerGradient: {
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
    zIndex: 10,
  },
  logoIconTile: {
    width: 67.37,
    height: 67.37,
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
    borderBottomColor: "#04cf92",
  },
  tabText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  tabTextActive: {
    color: "#04cf92",
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 0,
  },
  socialButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 42.4,
    width: "100%",
  },
  googleButton: {
    flex: 1,
    height: "100%",
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
    lineHeight: 20,
  },
  facebookButton: {
    flex: 1,
    height: "100%",
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
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    width: "100%",
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
    lineHeight: 16,
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  errorText: {
    color: "#DC2626",
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
    width: "100%",
    marginTop: 20,
  },
  inputWrap: {
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11, 26, 23, 0.08)",
    borderRadius: 20,
    height: 46.4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  inputRightAction: {
    padding: 6,
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
    marginTop: -4,
  },
  forgotPasswordText: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#04cf92",
    height: 44,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  bottomSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  switchPromptText: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  switchActionText: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  promoCard: {
    backgroundColor: "#E6FAF4",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 20,
  },
  promoIconWrap: {
    paddingTop: 2,
  },
  promoText: {
    flex: 1,
    color: "rgba(15, 109, 85, 0.8)",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
