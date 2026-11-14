import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
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
import { BrandMark, BrandWordmark } from "@/components/BrandArt";
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
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";

// WebP: 40 KB, against 890 KB for the PNG it replaces, with no visible difference at the size
// it is shown (at most 448 wide, under the green gradient).
const authBuildingImage = require("../../../../assets/auth-hero-building.webp");

export type AuthMode = "signin" | "signup";

export interface AuthCardProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  style?: StyleProp<ViewStyle>;
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, googleLogin, loading, error: storeError, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthModalFormData>({
    resolver: zodResolver(
      authModalSchema(mode, {
        confirmPasswordRequired: t("auth.confirmPasswordRequired"),
        passwordsDoNotMatch: t("auth.passwordsDoNotMatch"),
      }),
    ) as any,
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  // Rules differ per mode, so a stale value from the other tab must not survive.
  useEffect(() => {
    reset({ full_name: "", email: "", password: "", confirmPassword: "" });
  }, [mode, reset]);

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
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
      t("auth.forgotPasswordMessage"),
    );
  };

  // login/register catch their own errors and return false, so there is nothing to catch here.
  // confirmPassword is client-only: sign-up sends just the three fields the API accepts.
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("auth.close")}
                onPress={onClose}
                style={[styles.closeButton, webPointer]}
              >
                <X color={colorTokens.ink} size={18} strokeWidth={2.2} />
              </Pressable>
            ) : null}

            {/* Center Logo Icon Tile (Node 282:6 - 67.37px x 67.37px) */}
            <View style={styles.logoIconTile}>
              <BrandMark size={64} />
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
        <Pressable
          accessibilityRole="button"
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

        <Pressable
          accessibilityRole="button"
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

      {/* ─── Form Body ─── */}
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
          <View
            style={styles.errorAlert}
            testID="auth-error-alert"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.errorText}>{storeError}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {mode === "signup" ? (
            <View>
              <View style={[styles.inputWrap, errors.full_name && styles.inputWrapError]}>
                <User color={colorTokens.muted} size={16} style={styles.inputLeftIcon} />
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
                      placeholderTextColor={colorTokens.muted}
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
              <Mail color={colorTokens.muted} size={16} style={styles.inputLeftIcon} />
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
                    placeholderTextColor={colorTokens.muted}
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
              <Lock color={colorTokens.muted} size={16} style={styles.inputLeftIcon} />
              <Controller
                control={control}
                name="password"
                // After a failed submit, editing the password re-checks the confirm field too,
                // so a stale "Passwords do not match" clears as soon as they match.
                rules={{ deps: ["confirmPassword"] }}
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
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    textContentType={mode === "signin" ? "password" : "newPassword"}
                    placeholderTextColor={colorTokens.muted}
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={value ?? ""}
                  />
                )}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.inputRightAction}
                accessibilityLabel={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <EyeOff color={colorTokens.muted} size={16} />
                ) : (
                  <Eye color={colorTokens.muted} size={16} />
                )}
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            ) : null}
          </View>

          {mode === "signup" ? (
            <View>
              <View style={[styles.inputWrap, errors.confirmPassword && styles.inputWrapError]}>
                <Lock color={colorTokens.muted} size={16} style={styles.inputLeftIcon} />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={(val) => {
                        onChange(val);
                        if (storeError) clearError();
                      }}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      accessibilityLabel={t("auth.confirmPassword")}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      placeholderTextColor={colorTokens.muted}
                      secureTextEntry={!showConfirmPassword}
                      style={styles.textInput}
                      value={value ?? ""}
                    />
                  )}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.inputRightAction}
                  accessibilityLabel={
                    showConfirmPassword
                      ? t("auth.hideConfirmPassword")
                      : t("auth.showConfirmPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff color={colorTokens.muted} size={16} />
                  ) : (
                    <Eye color={colorTokens.muted} size={16} />
                  )}
                </Pressable>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
              ) : null}
            </View>
          ) : null}

          {mode === "signin" ? (
            <View style={styles.forgotPasswordRow}>
              <Pressable accessibilityRole="button" onPress={handleForgotPassword} style={webPointer}>
                <Text style={styles.forgotPasswordText}>
                  {t("auth.forgotPassword")}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            testID="auth-submit-button"
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

        {/* Bottom Switch Link */}
        <View style={styles.bottomSwitchRow}>
          <Text style={styles.switchPromptText}>
            {mode === "signin"
              ? `${t("auth.dontHaveAccount")} `
              : `${t("auth.alreadyHaveAccount")} `}
          </Text>
          <Pressable
            accessibilityRole="button"
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
      </ContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 448,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: colorTokens.border,
    // Android elevation only: boxShadow is a CSS/web property that Android
    // ignores, but if both are present the RN runtime on Android combines them
    // into a doubled black halo. Keep them on separate branches.
    ...Platform.select({
      android: { elevation: 8 },
      default: { boxShadow: "0px 25px 50px rgba(0, 0, 0, 0.25)" },
    }),
  },
  modalCard: {
    maxHeight: "92%",
    flexShrink: 1,
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
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1.2,
    borderColor: colorTokens.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoIconTile: {
    width: 64,
    height: 64,
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
    height: 48,
    borderBottomWidth: 1.2,
    borderBottomColor: colorTokens.border,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: colorTokens.brand,
  },
  tabText: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  tabTextActive: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexGrow: 0,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colorTokens.border,
  },
  dividerText: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  errorAlert: {
    backgroundColor: colorTokens.errorSurface,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  errorText: {
    color: colorTokens.errorText,
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: "center",
  },
  formContainer: {
    gap: 12,
    width: "100%",
    marginTop: 16,
  },
  inputWrap: {
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1.2,
    borderColor: colorTokens.border,
    borderRadius: radius.pill,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputWrapError: {
    borderColor: colorTokens.errorText,
    backgroundColor: colorTokens.errorSurface,
  },
  consentText: {
    marginTop: 10,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  consentLink: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
  fieldError: {
    marginTop: 4,
    marginLeft: 4,
    color: colorTokens.errorText,
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
    color: colorTokens.ink,
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
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colorTokens.brand,
    height: 44,
    borderRadius: radius.pill,
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
    marginTop: 16,
  },
  switchPromptText: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  switchActionText: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
