import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Lock, ShieldAlert } from "@/components/icons";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { hasAnyAdminPermission, hasPermission } from "@/lib/permissions";
import { colorTokens, colors, fonts, radius, webPointer } from "@/theme";
import { AppChrome, type ActivePage } from "./AppChrome";
import { useTranslation } from "@/i18n";

interface RequireAuthProps {
  children: ReactNode;
  /** Also require an admin role or any admin-level permission. */
  admin?: boolean;
  /**
   * Also require this permission. Pass the one the page's API calls need, so
   * the page never renders for someone whose requests would be refused.
   */
  permission?: string;
  /** Nav highlight for the gate's chrome. Children supply their own chrome. */
  active?: ActivePage;
}

/**
 * Route-level auth gate.
 *
 * Renders a gate rather than redirecting, so the user stays on the URL they
 * asked for and sees the page as soon as the modal login succeeds — the same
 * intent-preserving behaviour `useRequireAuth` gives action-level gating.
 */
export function RequireAuth({
  children,
  admin = false,
  permission,
  active = "home",
}: RequireAuthProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const userRoles = useAuthStore((s) => s.userRoles);

  const needsSignIn = hydrated && !user;

  useEffect(() => {
    if (needsSignIn) useAuthModalStore.getState().open();
  }, [needsSignIn]);

  // Session restore is async; deciding before it settles would bounce a
  // signed-in user out of their own page on refresh.
  if (!hydrated) {
    return (
      <AppChrome active={active}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      </AppChrome>
    );
  }

  if (!user) {
    return (
      <AppChrome active={active}>
      <View style={styles.center}>
        <View style={styles.iconWell}>
          <Lock color={colors.greenOnLight} size={24} />
        </View>
        <Text style={styles.title}>{t("auth.signInToContinue")}</Text>
        <Text style={styles.copy}>
          {t("auth.signInRequiredDesc")}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => useAuthModalStore.getState().open()}
          style={({ pressed }) => [styles.cta, webPointer, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>{t("auth.signIn")}</Text>
        </Pressable>
      </View>
      </AppChrome>
    );
  }

  const lacksAdmin = admin && !hasAnyAdminPermission(userRoles);
  const lacksPermission = permission !== undefined && !hasPermission(userRoles, permission);
  if (lacksAdmin || lacksPermission) {
    return (
      <AppChrome active={active}>
      <View style={styles.center}>
        <View style={[styles.iconWell, styles.iconWellWarn]}>
          <ShieldAlert color={colors.orange} size={24} />
        </View>
        <Text style={styles.title}>{t("auth.accessDenied")}</Text>
        <Text style={styles.copy}>
          {t("auth.adminRequiredDesc")}
        </Text>
      </View>
      </AppChrome>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 32,
  },
  iconWell: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.greenLight,
    marginBottom: 4,
  },
  iconWellWarn: {
    backgroundColor: colors.orangeLight,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 20,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  copy: {
    maxWidth: 380,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  cta: {
    minHeight: 44,
    marginTop: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.green,
  },
  pressed: { opacity: 0.85 },
  ctaText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
