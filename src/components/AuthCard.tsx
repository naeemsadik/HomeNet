import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { notify } from "@/lib/alert";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { GOOGLE_SIGN_IN_AVAILABLE } from "@/lib/features";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import { BrandMark, BrandWordmark } from "./BrandArt";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from "@/components/icons";
import { useAuthStore } from "@/stores/authStore";
import { authModalSchema, type AuthModalFormData } from "@/lib/schemas/auth";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";

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
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, googleLogin, loading, error: storeError, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthModalFormData>({
    resolver: zodResolver(authModalSchema(mode)) as any,
    defaultValues: { full_name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  // Rules differ per mode, so a stale value from the other tab must not survive.
  useEffect(() => {
    reset({ full_name: "", email: "", password: "" });
  }, [mode, reset]);

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
  };

  const handleGoogleCredential = async (idToken: string) => {
    if (await googleLogin(idToken)) {
      if (onClose) onClose();
      if (onSuccess) onSuccess();
    }
  };

  // The sign-up form can be a modal over the page: close it so the page that opens is seen.
  const openLegalPage = (path: "/terms" | "/privacy") => {
    onClose?.();
    router.push(path as never);
  };

  // There is no password-reset endpoint yet, so point people at the contact
  // address the About page publishes (the old one was on a different domain,
  // homenet.com, and "account settings" can't be reached while signed out).
  const handleForgotPassword = () => {
    notify(
      t("auth.forgotPasswordTitle"),
      t("auth.forgotPasswordMessage")
    );
  };

  const onSubmit = async (data: AuthModalFormData) => {
    const email = data.email.trim();
    const ok =
      mode === "signin"
        ? await login({ email, password: data.password })
        : await register({
            full_name: (data.full_name ?? "").trim(),
            email,
            password: data.password,
          });

    if (ok) {
      if (onClose) onClose();
      if (onSuccess) onSuccess();
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
              <Pressable accessibilityRole="button"
                accessibilityLabel={t("auth.close")}
                onPress={onClose}
                style={[styles.closeButton, webPointer]}
              >
                <X color="#0B1A17" size={18} strokeWidth={2.2} />
              </Pressable>
            ) : null}

            {/* Center Logo Icon Tile (Node 282:6 - 67.37px x 67.37px) */}
            <View style={styles.logoIconTile}>
              <BrandMark size={46} tone="light" />
            </View>

            {/* App Title (Node 282:10) */}
            <View accessibilityRole="header" accessibilityLabel="Homenet BD" style={styles.brandTitle}>
              <BrandWordmark height={26} tone="light" />
            </View>

            {/* Subtitle (Node 282:12) */}
            <Text style={styles.brandSubtitle}>
              {t("auth.brandSubtitle")}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* ─── Mode Switcher Tabs (Node 282:13 - 50.4px height) ─── */}
      <View style={styles.tabSwitcher}>
        <Pressable accessibilityRole="button"
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
            {t("auth.signInTab")}
          </Text>
        </Pressable>

        <Pressable accessibilityRole="button"
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
            {t("auth.signUpTab")}
          </Text>
        </Pressable>
      </View>

      {/* ─── Form Body (Node 282:18 - px: 32px, py: 24px) ─── */}
      <ContentWrapper {...(contentWrapperProps as any)}>
        {GOOGLE_SIGN_IN_AVAILABLE ? (
          <>
            <GoogleSignInButton mode={mode} disabled={loading} onCredential={handleGoogleCredential} />

            {/* Divider (Node 282:31) */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("auth.orContinueWithEmail")}</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        ) : null}

        {/* Server-side error; field errors render inline below each input. */}
        {storeError ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>{storeError}</Text>
          </View>
        ) : null}

        {/* Form Inputs (Node 282:37) */}
        <View style={styles.formContainer}>
          {mode === "signup" ? (
            <View>
              <View style={[styles.inputWrap, errors.full_name && styles.inputWrapError]}>
                <User color="#5C6B66" size={16} style={styles.inputLeftIcon} />
                <Controller
                  control={control}
                  name="full_name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={(val) => {
                        onChange(val);
                        if (storeError) clearError();
                      }}
                      placeholder={t("auth.fullNamePlaceholder")}
                      accessibilityLabel={t("auth.fullName")}
                      placeholderTextColor="rgba(11, 26, 23, 0.5)"
                      style={styles.textInput}
                      value={value ?? ""}
                    />
                  )}
                />
              </View>
              {errors.full_name ? (
                <Text style={styles.fieldError}>{errors.full_name.message}</Text>
              ) : null}
            </View>
          ) : null}

          <View>
            <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
              <Mail color="#5C6B66" size={16} style={styles.inputLeftIcon} />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={(val) => {
                      onChange(val);
                      if (storeError) clearError();
                    }}
                    placeholder={t("auth.emailAddressPlaceholder")}
                    accessibilityLabel={t("auth.email")}
                    placeholderTextColor="rgba(11, 26, 23, 0.5)"
                    style={styles.textInput}
                    value={value ?? ""}
                  />
                )}
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            ) : null}
          </View>

          <View>
            <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
              <Lock color="#5C6B66" size={16} style={styles.inputLeftIcon} />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(val) => {
                      onChange(val);
                      if (storeError) clearError();
                    }}
                    placeholder={mode === "signin" ? t("auth.password") : t("auth.createPasswordPlaceholder")}
                    accessibilityLabel={mode === "signin" ? t("auth.password") : t("auth.createPasswordPlaceholder")}
                    placeholderTextColor="rgba(11, 26, 23, 0.5)"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={value ?? ""}
                  />
                )}
              />
              <Pressable accessibilityRole="button"
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.inputRightAction}
                accessibilityLabel={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <EyeOff color="#5C6B66" size={16} />
                ) : (
                  <Eye color="#5C6B66" size={16} />
                )}
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            ) : null}
          </View>

          {mode === "signin" ? (
            <View style={styles.forgotPasswordRow}>
              <Pressable accessibilityRole="button" onPress={handleForgotPassword} style={webPointer}>
                <Text style={styles.forgotPasswordText}>
                  {t("auth.forgotPassword")}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Submit Button (Node 282:60 - 44px height, rounded 20px) */}
          <Pressable accessibilityRole="button"
            disabled={loading}
            onPress={handleSubmit(onSubmit)}
            style={[styles.submitButton, loading && { opacity: 0.7 }, webPointer]}
          >
            {loading ? (
              <ActivityIndicator color={colorTokens.onBrand} size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {mode === "signin" ? t("auth.signInButton") : t("auth.createAccountButton")}
                </Text>
                <ArrowRight color={colorTokens.onBrand} size={16} strokeWidth={2.2} />
              </>
            )}
          </Pressable>

          {mode === "signup" ? (
            // Terms and privacy acceptance: Google Play requires apps with
            // user-generated content (listings, photos) to put terms in front of
            // the user before they create anything.
            <Text style={styles.consentText}>
              {t("auth.consentPrefix")}
              <Text accessibilityRole="link" onPress={() => openLegalPage("/terms")} style={styles.consentLink}>
                {t("footer.termsOfUse")}
              </Text>
              {t("auth.consentAnd")}
              <Text accessibilityRole="link" onPress={() => openLegalPage("/privacy")} style={styles.consentLink}>
                {t("footer.privacyPolicy")}
              </Text>
              {t("auth.consentSuffix")}
            </Text>
          ) : null}
        </View>

        {/* Bottom Switch Link (Node 282:65) */}
        <View style={styles.bottomSwitchRow}>
          <Text style={styles.switchPromptText}>
            {mode === "signin"
              ? `${t("auth.dontHaveAccount")} `
              : `${t("auth.alreadyHaveAccount")} `}
          </Text>
          <Pressable accessibilityRole="button"
            onPress={() =>
              handleTabSwitch(mode === "signin" ? "signup" : "signin")
            }
            style={webPointer}
          >
            <Text style={styles.switchActionText}>
              {mode === "signin" ? t("auth.signUpFree") : t("auth.signIn")}
            </Text>
          </Pressable>
        </View>

        {/* AI Promotional Insights Card (Node 282:70) */}
        <View style={styles.promoCard}>
          <View style={styles.promoIconWrap}>
            <FigmaSparkleIcon />
          </View>
          <Text style={styles.promoText}>
            {t("auth.promoText")}
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
    height: 32,
    justifyContent: "center",
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
  inputWrapError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  consentText: {
    marginTop: 12,
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  consentLink: {
    // brandText, not the #04cf92 fill: the fill is 2:1 on white and fails for text.
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
  fieldError: {
    marginTop: 6,
    marginLeft: 4,
    color: "#DC2626",
    fontFamily: fonts.medium,
    fontSize: 12,
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
    color: colorTokens.onBrand,
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
