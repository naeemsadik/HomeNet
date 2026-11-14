import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, ShieldCheck } from "@/components/icons";
import { getRoleName, hasAnyAdminPermission, hasPermission } from "@/lib/permissions";
import { getAdminProperties } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import { useAdminContextStore } from "@/stores/useAdminContextStore";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";

/** Height the page's scroll padding must account for. Read by AppChrome. */
export const ADMIN_BAR_HEIGHT = 40;

/** Controls are 28 high inside a 40 strip; this brings the touch area to 44. */
const HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 4 } as const;

/**
 * A quiet strip under the navbar for signed-in staff: who they are, whether
 * moderation tools are on for this page, how many listings wait for review,
 * and the way back to the admin console.
 *
 * It uses the same light surfaces and the one brand green as the rest of the
 * site, so it reads as part of HomeNet and not as a second product. When tools
 * are on, the strip takes the brand tint: that is the only state change.
 *
 * Rendered only after hydration (`hydrated && isStaff`), keeping zero staff
 * markup in static exports served to visitors and crawlers.
 */
export function AdminContextBar() {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const userRoles = useAuthStore((s) => s.userRoles);
  const isStaff = user !== null && hasAnyAdminPermission(userRoles);
  const canModerate = user !== null && hasPermission(userRoles, "moderate_listing");
  const roleName = getRoleName(userRoles);

  const armed = useAdminContextStore((s) => s.armed);
  const toggle = useAdminContextStore((s) => s.toggle);
  const resetForRoute = useAdminContextStore((s) => s.resetForRoute);

  useEffect(() => {
    resetForRoute();
  }, [pathname, resetForRoute]);

  const inAdminConsole = pathname.startsWith("/admin");

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin", "properties", "pending-count", user?.id ?? null],
    queryFn: async () => {
      const response = await getAdminProperties({ status: "pending", page: 1, limit: 1 });
      return response.data?.total ?? 0;
    },
    enabled: hydrated && canModerate && !inAdminConsole,
    staleTime: 60_000,
    retry: false,
  });

  if (!hydrated || !isStaff || inAdminConsole) return null;

  const roleLabel = (roleName ?? t("moderation.staff")).replace(/_/g, " ");
  const count = formatLocalizedNumber(pendingCount, language);

  return (
    <View style={[styles.bar, armed && styles.barArmed]}>
      <View style={[styles.inner, isPhone && styles.innerPhone]}>
        <View style={styles.leftCluster}>
          <ShieldCheck color={colorTokens.brandText} size={16} strokeWidth={2} />
          <Text numberOfLines={1} style={styles.roleText}>
            {roleLabel}
          </Text>
          {!isPhone ? (
            <Text numberOfLines={1} style={[styles.contextText, armed && styles.contextTextArmed]}>
              {armed ? t("moderation.moderationActive") : t("moderation.publicMode")}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightCluster}>
          {canModerate && pendingCount > 0 ? (
            <Pressable
              accessibilityLabel={t("moderation.pendingReviewsAria", { count })}
              accessibilityRole="link"
              hitSlop={HIT_SLOP}
              onPress={() => router.push("/admin" as never)}
              style={({ pressed }) => [styles.link, pressed && styles.pressed, webPointer]}
            >
              <Clock color={colorTokens.brandText} size={14} strokeWidth={2} />
              <Text numberOfLines={1} style={styles.linkTextBrand}>
                {isPhone ? count : t("moderation.pendingReviews", { count })}
              </Text>
            </Pressable>
          ) : null}

          {canModerate ? (
            <Pressable
              accessibilityLabel={t("moderation.toggleLabel")}
              accessibilityRole="switch"
              aria-checked={armed}
              hitSlop={HIT_SLOP}
              onPress={toggle}
              style={({ pressed }) => [
                styles.toggle,
                armed && styles.toggleArmed,
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              <View style={[styles.track, armed && styles.trackArmed]}>
                <View style={[styles.knob, armed && styles.knobArmed]} />
              </View>
              <Text numberOfLines={1} style={styles.toggleLabel}>
                {`${t(isPhone ? "moderation.moderate" : "moderation.moderationTools")}: ${
                  armed ? t("moderation.toolsOn") : t("moderation.toolsOff")
                }`}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityLabel={t("moderation.backToAdmin")}
            accessibilityRole="link"
            hitSlop={HIT_SLOP}
            onPress={() => router.push("/admin" as never)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed, webPointer]}
          >
            <ArrowLeft color={colorTokens.ink} size={14} strokeWidth={2} />
            {!isPhone ? (
              <Text numberOfLines={1} style={styles.linkText}>
                {t("moderation.exitToConsole")}
              </Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: ADMIN_BAR_HEIGHT,
    width: "100%",
    backgroundColor: colorTokens.surfaceSunken,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  barArmed: {
    backgroundColor: colorTokens.brandSurface,
    borderBottomColor: colorTokens.brandBorder,
  },
  inner: {
    width: "100%",
    maxWidth: layout.containerMaxWidth,
    paddingHorizontal: layout.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  innerPhone: { paddingHorizontal: layout.gutterPhone, gap: 8 },
  leftCluster: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 0 },
  roleText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    textTransform: "capitalize",
    flexShrink: 1,
  },
  contextText: { color: colorTokens.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, flexShrink: 1 },
  contextTextArmed: { color: colorTokens.brandText, fontFamily: fonts.semiBold },
  rightCluster: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 0 },
  link: { flexDirection: "row", alignItems: "center", gap: 6, height: 28, paddingHorizontal: 4, borderRadius: radius.sm },
  linkText: { color: colorTokens.ink, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  linkTextBrand: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.muted,
  },
  toggleArmed: { borderColor: colorTokens.brandText },
  track: {
    width: 26,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.subtle,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  trackArmed: { backgroundColor: colorTokens.brandText, alignItems: "flex-end" },
  knob: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colorTokens.surface },
  knobArmed: {},
  toggleLabel: { color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.7 },
});
