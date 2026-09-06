import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Home, X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useAuthStore } from "@/stores/authStore";
import { colors, fonts, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

// ─── Social Button Icons (inline SVG) ────────────────────────────────────────

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107" />
      <Path d="M5.3 14.7l7.1 5.2C14.1 16.2 18.7 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 5.3 14.7z" fill="#FF3D00" />
      <Path d="M24 44c5.2 0 10-1.8 13.7-4.9l-6.9-5.5C28.7 35.2 26.5 36 24 36c-6.1 0-11.3-4.1-13.2-9.6l-7.2 5.6C7.7 38.4 15.2 44 24 44z" fill="#4CAF50" />
      <Path d="M44.5 20H24v8.5h11.8c-.9 3-3.1 5.5-5.9 7.1l6.9 5.5C41.3 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2" />
    </Svg>
  );
}

function FacebookIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
      <Path d="M16.671 15.47L17.203 12h-3.328V9.75c0-.949.465-1.874 1.956-1.874h1.513V4.923s-1.374-.235-2.686-.235c-2.741 0-4.533 1.661-4.533 4.668V12H7.078v3.47h3.047v8.385a12.09 12.09 0 003.75 0V15.47h2.796z" fill="#FFFFFF" />
    </Svg>
  );
}

// ─── Floating Input (local modal version) ────────────────────────────────────

function ModalInput({
  label,
  value,
  onChangeText,
  icon: Icon,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: typeof Mail;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  autoCapitalize?: "none" | "words" | "sentences";
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value.length > 0;
  const active = focused || hasValue;

  const borderColor = focused ? colors.green : "rgba(11,26,23,0.10)";

  return (
    <View style={modalStyles.inputWrapper}>
      <View style={[modalStyles.inputRow, { borderColor }, focused && modalStyles.inputFocused]}>
        <Icon
          size={17}
          color={focused ? colors.green : "#8C9A95"}
          style={{ marginLeft: 14 }}
        />
        <View style={modalStyles.inputInner}>
          <Text style={[
            modalStyles.floatingLabel,
            active && modalStyles.floatingLabelActive,
            focused && { color: colors.green },
          ]}>
            {label}
          </Text>
          <View style={modalStyles.inputTextWrap}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType || "default"}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              style={[
                modalStyles.textInput,
                active && modalStyles.textInputActive,
              ]}
              placeholderTextColor="transparent"
            />
          </View>
        </View>
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={[modalStyles.eyeBtn, webPointer]}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={17} color="#8C9A95" />
            ) : (
              <Eye size={17} color="#8C9A95" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────

export function AuthModal() {
  const { visible, onSuccess, close } = useAuthModalStore();
  const { login, register, loading, error, clearError } = useAuthStore();
  const { isPhone } = useResponsive();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setTab("login");
      setEmail("");
      setPassword("");
      setFullName("");
      setConfirmPassword("");
      setLocalError(null);
      clearError();
    }
  }, [visible]);

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim() || !password.trim()) {
      setLocalError("Please fill in all fields");
      return;
    }
    const success = await login({ email: email.trim(), password });
    if (success) {
      close();
      onSuccess?.();
    }
  };

  const handleRegister = async () => {
    setLocalError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setLocalError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
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
      close();
      onSuccess?.();
    }
  };

  const displayError = localError || error;

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={close} />

        <View style={[
          modalStyles.container,
          isPhone && modalStyles.containerPhone,
        ]}>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {/* ── Gradient Header ────────────────────────────────────────── */}
            <LinearGradient
              colors={["#0F6D55", "#0B5743", "#1A3A2F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={modalStyles.header}
            >
              <Pressable
                onPress={close}
                style={[modalStyles.closeBtn, webPointer]}
                accessibilityLabel="Close"
              >
                <X color="rgba(255,255,255,0.85)" size={20} />
              </Pressable>

              <View style={modalStyles.logoBadge}>
                <Home color="#FFFFFF" size={24} strokeWidth={2} />
              </View>
              <Text style={modalStyles.headerTitle}>Homenet</Text>
              <Text style={modalStyles.headerSub}>Bangladesh's AI property marketplace</Text>
            </LinearGradient>

            {/* ── Tab Switcher ────────────────────────────────────────────── */}
            <View style={modalStyles.tabRow}>
              <Pressable
                onPress={() => { setTab("login"); setLocalError(null); clearError(); }}
                style={[modalStyles.tabBtn, tab === "login" && modalStyles.tabBtnActive, webPointer]}
              >
                <Text style={[modalStyles.tabText, tab === "login" && modalStyles.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setTab("register"); setLocalError(null); clearError(); }}
                style={[modalStyles.tabBtn, tab === "register" && modalStyles.tabBtnActive, webPointer]}
              >
                <Text style={[modalStyles.tabText, tab === "register" && modalStyles.tabTextActive]}>
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <View style={modalStyles.body}>

              {/* Error Banner */}
              {displayError ? (
                <View style={modalStyles.errorBanner}>
                  <Text style={modalStyles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              {tab === "login" ? (
                <>
                  {/* Social Buttons */}
                  <View style={modalStyles.socialRow}>
                    <Pressable style={[modalStyles.socialBtn, modalStyles.socialBtnGoogle, webPointer]}>
                      <GoogleIcon />
                      <Text style={modalStyles.socialBtnText}>Google</Text>
                    </Pressable>
                    <Pressable style={[modalStyles.socialBtn, modalStyles.socialBtnFacebook, webPointer]}>
                      <FacebookIcon />
                      <Text style={modalStyles.socialBtnTextWhite}>Facebook</Text>
                    </Pressable>
                  </View>

                  {/* Divider */}
                  <View style={modalStyles.divider}>
                    <View style={modalStyles.dividerLine} />
                    <Text style={modalStyles.dividerText}>or continue with email</Text>
                    <View style={modalStyles.dividerLine} />
                  </View>

                  {/* Email & Password */}
                  <ModalInput
                    label="Email address"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setLocalError(null); }}
                    icon={Mail}
                    keyboardType="email-address"
                  />
                  <ModalInput
                    label="Password"
                    value={password}
                    onChangeText={(v) => { setPassword(v); setLocalError(null); }}
                    icon={Lock}
                    secureTextEntry
                  />

                  <Pressable style={[modalStyles.forgotLink, webPointer]}>
                    <Text style={modalStyles.forgotText}>Forgot password?</Text>
                  </Pressable>

                  {/* Sign In Button */}
                  <Pressable
                    onPress={handleLogin}
                    disabled={loading || !email || !password}
                    style={[
                      modalStyles.primaryBtn,
                      (loading || !email || !password) && modalStyles.primaryBtnDisabled,
                      webPointer,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={modalStyles.primaryBtnText}>Sign In</Text>
                        <ArrowRight color="#FFFFFF" size={17} />
                      </>
                    )}
                  </Pressable>

                  {/* Footer */}
                  <View style={modalStyles.footerRow}>
                    <Text style={modalStyles.footerText}>Don't have an account? </Text>
                    <Pressable onPress={() => { setTab("register"); setLocalError(null); clearError(); }} style={webPointer}>
                      <Text style={modalStyles.footerLink}>Sign up free</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  {/* Register Tab */}
                  <ModalInput
                    label="Full Name"
                    value={fullName}
                    onChangeText={(v) => { setFullName(v); setLocalError(null); }}
                    icon={User}
                    autoCapitalize="words"
                  />
                  <ModalInput
                    label="Email address"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setLocalError(null); }}
                    icon={Mail}
                    keyboardType="email-address"
                  />
                  <ModalInput
                    label="Password"
                    value={password}
                    onChangeText={(v) => { setPassword(v); setLocalError(null); }}
                    icon={Lock}
                    secureTextEntry
                  />
                  <ModalInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); setLocalError(null); }}
                    icon={Lock}
                    secureTextEntry
                  />

                  {/* Create Account Button */}
                  <Pressable
                    onPress={handleRegister}
                    disabled={loading || !fullName || !email || !password || !confirmPassword}
                    style={[
                      modalStyles.primaryBtn,
                      (loading || !fullName || !email || !password || !confirmPassword) && modalStyles.primaryBtnDisabled,
                      webPointer,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={modalStyles.primaryBtnText}>Create Account</Text>
                        <ArrowRight color="#FFFFFF" size={17} />
                      </>
                    )}
                  </Pressable>

                  {/* Footer */}
                  <View style={modalStyles.footerRow}>
                    <Text style={modalStyles.footerText}>Already have an account? </Text>
                    <Pressable onPress={() => { setTab("login"); setLocalError(null); clearError(); }} style={webPointer}>
                      <Text style={modalStyles.footerLink}>Sign in</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {/* Trust Banner */}
              <View style={modalStyles.trustBanner}>
                <Sparkles color="#0F6D55" size={16} />
                <Text style={modalStyles.trustText}>
                  Join 240,000+ users getting AI-powered property insights tailored to your searches.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11,26,23,0.50)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Container
  container: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 20,
  },
  containerPhone: {
    maxWidth: "95%",
    maxHeight: "95%",
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 3,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.08)",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#0F6D55",
  },
  tabText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#8C9A95",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#0F6D55",
  },

  // Body
  body: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Error Banner
  errorBanner: {
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F9D8D8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D44",
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },

  // Social Buttons
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.3,
  },
  socialBtnGoogle: {
    borderColor: "rgba(11,26,23,0.12)",
    backgroundColor: "#FFFFFF",
  },
  socialBtnFacebook: {
    borderColor: "#1877F2",
    backgroundColor: "#1877F2",
  },
  socialBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    color: "#0B1A17",
    fontWeight: "600",
  },
  socialBtnTextWhite: {
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(11,26,23,0.08)",
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#8C9A95",
  },

  // Input
  inputWrapper: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderWidth: 1.3,
    borderRadius: 13,
    backgroundColor: "#FBFDFC",
    overflow: "hidden",
  },
  inputFocused: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F6D55",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  inputInner: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 12,
  },
  floatingLabel: {
    position: "absolute",
    top: 16,
    left: 12,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#8C9A95",
    zIndex: 1,
    pointerEvents: "none",
  } as any,
  floatingLabelActive: {
    top: 6,
    fontSize: 10,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.2,
  },
  inputTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  // Forgot Password
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: -2,
  },
  forgotText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#0F6D55",
    fontWeight: "600",
  },

  // Primary Button
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0F6D55",
    marginBottom: 16,
  },
  primaryBtnDisabled: {
    backgroundColor: "#9BADA3",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Footer Links
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#5C6B66",
  },
  footerLink: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#0F6D55",
    fontWeight: "700",
  },

  // Trust Banner
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#E7F2EE",
    borderRadius: 12,
  },
  trustText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#0B5743",
    lineHeight: 17,
  },

  // TextInput
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    outlineStyle: "none",
  } as any,
  textInputActive: {
    paddingTop: 20,
    paddingBottom: 6,
  },
});
