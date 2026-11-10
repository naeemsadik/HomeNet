import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { ArrowLeft, ShieldCheck } from "@/components/icons";
import { getRoleName, hasAnyAdminPermission } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";
import { useAdminContextStore } from "@/stores/useAdminContextStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";

/** Height the page's scroll padding must account for. Read by AppChrome. */
export const ADMIN_BAR_HEIGHT = 36;

/**
 * The staff strip: says who you are, lets you arm moderation, and carries the
 * way back to the admin panel — the indicator and the exit in one element.
 *
 * Rendered only after hydration, so it never reaches the static export, which
 * ships to every visitor and to Googlebot.
 *
 * Arming is per-surface and resets on navigation: arriving somewhere new
 * always starts read-only. That inverts the failure moderators reported on
 * Reddit, where a mode left switched on elsewhere is assumed to be on here.
 */
export function AdminContextBar() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isStaff = useAuthStore(
    (s) => s.user !== null && hasAnyAdminPermission(s.userRoles),
  );
  const roleName = useAuthStore((s) => getRoleName(s.userRoles));
  const armed = useAdminContextStore((s) => s.armed);
  const toggle = useAdminContextStore((s) => s.toggle);
  const resetForRoute = useAdminContextStore((s) => s.resetForRoute);

  useEffect(() => {
    resetForRoute();
  }, [pathname, resetForRoute]);

  // Not staff, not hydrated, or already inside /admin: nothing to say. Showing
  // it there would cost height while telling the reader what they can see.
  if (!hydrated || !isStaff || pathname.startsWith("/admin")) return null;

  return (
    <View style={[styles.bar, armed && styles.barArmed]}>
      <View style={styles.identity}>
        <ShieldCheck color={colorTokens.onInk} size={14} strokeWidth={2.4} />
        {!isPhone ? (
          <Text style={styles.role}>{roleName ?? t("moderation.staff")}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: armed }}
        accessibilityLabel={t("moderation.toggleLabel")}
        onPress={toggle}
        style={[styles.toggle, armed && styles.toggleOn, webPointer]}
      >
        <Text style={[styles.toggleText, armed && styles.toggleTextOn]}>
          {armed ? t("moderation.moderating") : t("moderation.moderate")}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t("moderation.backToAdmin")}
        onPress={() => router.push("/admin" as never)}
        style={[styles.back, webPointer]}
      >
        <ArrowLeft color={colorTokens.onInk} size={14} strokeWidth={2.4} />
        {!isPhone ? (
          <Text style={styles.backText}>{t("moderation.backToAdmin")}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: ADMIN_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.gutter,
    backgroundColor: colorTokens.ink,
  },
  // Armed is the only state that gets colour, and it is a hairline rather than
  // a fill: the strip must not start competing with the page it sits over.
  barArmed: {
    borderBottomWidth: 2,
    borderBottomColor: colorTokens.brand,
  },
  identity: { flexDirection: "row", alignItems: "center", gap: 7 },
  role: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  toggleOn: { backgroundColor: colorTokens.brand, borderColor: colorTokens.brand },
  toggleText: { color: colorTokens.onInk, fontFamily: fonts.semiBold, fontSize: 12 },
  toggleTextOn: { color: colorTokens.onBrand },
  back: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: colorTokens.onInk, fontFamily: fonts.medium, fontSize: 12 },
});
