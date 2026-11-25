import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { GoogleSignInButtonProps } from "@/components/GoogleSignInButton";
import { useTranslation } from "@/i18n";
import { notify } from "@/lib/alert";
import { GOOGLE_CLIENT_ID } from "@/lib/features";
import { colorTokens, fonts, googleLogoColors, radius } from "@/theme";

/** Google's "G", in its own four colours, as its branding rules require. */
function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill={googleLogoColors.red} d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill={googleLogoColors.blue} d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill={googleLogoColors.yellow} d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill={googleLogoColors.green} d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

/**
 * The Android app's Google sign-in: the phone's own account picker, which hands back an ID token
 * made out to the website's client id (`webClientId`), the audience the API verifies. Google
 * recognises the app itself by its package name and signing certificate, registered as an
 * Android client in the same Google Cloud project.
 */
export function GoogleSignInButton({ mode, onCredential, disabled }: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);
  const blocked = disabled || opening;
  const label = t(mode === "signup" ? "auth.signUpWithGoogle" : "auth.signInWithGoogle");

  const signIn = async () => {
    if (blocked || !GOOGLE_CLIENT_ID) return;
    setOpening(true);
    try {
      // Loaded on the first tap: an app built without the native module (Expo Go) still opens.
      const { GoogleSignin, statusCodes } =
        require("@react-native-google-signin/google-signin") as typeof import("@react-native-google-signin/google-signin");
      try {
        GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Forget the last choice, so the account picker shows and someone can switch accounts.
        await GoogleSignin.signOut();
        const response = await GoogleSignin.signIn();
        if (response.type !== "success") return;
        if (!response.data.idToken) throw new Error("Google returned no ID token");
        onCredential(response.data.idToken);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === statusCodes.SIGN_IN_CANCELLED || code === statusCodes.IN_PROGRESS) return;
        notify(
          t("auth.googleErrorTitle"),
          t(code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE ? "errors.googleUnavailable" : "errors.googleFailed"),
        );
      }
    } catch {
      notify(t("auth.googleErrorTitle"), t("errors.googleUnavailable"));
    } finally {
      setOpening(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-disabled={blocked}
      aria-busy={opening}
      disabled={blocked}
      onPress={signIn}
      testID="google-sign-in"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, blocked && styles.blocked]}
    >
      <View style={styles.logoSlot}>
        {opening ? <ActivityIndicator color={colorTokens.muted} size="small" /> : <GoogleLogo />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.muted,
    borderRadius: radius.lg,
  },
  pressed: { backgroundColor: colorTokens.surfaceSunken },
  blocked: { opacity: 0.5 },
  // Holds the logo's room while the spinner replaces it, so the words do not move.
  logoSlot: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  label: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 14, color: colorTokens.ink, textAlign: "center" },
});
