import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, ShieldCheck, SlidersHorizontal } from "@/components/icons";
import { getRoleName, hasAnyAdminPermission, hasPermission } from "@/lib/permissions";
import { getAdminProperties } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import { useAdminContextStore } from "@/stores/useAdminContextStore";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";

/** Height the page's scroll padding must account for. Read by AppChrome. */
export const ADMIN_BAR_HEIGHT = 40;

/**
 * Ambient Staff Utility Bar sitting above public pages for signed-in staff.
 *
 * Lives strictly in the Ink / Slate / Charcoal operator channel using crisp
 * hairline borders and tone shifts so staff controls never compete with
 * buyer-facing surfaces.
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

  return (
    <View style={[styles.bar, armed && styles.barArmed]}>
      <View style={[styles.inner, isPhone && styles.innerPhone]}>
        {/* Left: Role Badge + Context State */}
        <View style={styles.leftCluster}>
          <View style={styles.rolePill}>
            <ShieldCheck color={colorTokens.onInk} size={14} strokeWidth={1.8} />
            <Text numberOfLines={1} style={styles.roleText}>
              {roleLabel}
            </Text>
          </View>

          {!isPhone ? (
            <View style={styles.contextTag}>
              <View style={[styles.statusDot, armed && styles.statusDotArmed]} />
              <Text
                numberOfLines={1}
                style={[styles.contextText, armed && styles.contextTextArmed]}
              >
                {armed ? t("moderation.moderationActive") : t("moderation.publicMode")}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right: Pending Count + Tools Switch + Admin Exit */}
        <View style={styles.rightCluster}>
          {canModerate && pendingCount > 0 ? (
            <Pressable
              accessibilityLabel={t("moderation.pendingReviewsAria", {
                count: formatLocalizedNumber(pendingCount, language),
              })}
              accessibilityRole="link"
              onPress={() => router.push("/admin" as never)}
              style={({ pressed }) => [
                styles.pendingPill,
                pressed && styles.pressedSubtle,
                webPointer,
              ]}
            >
              <Clock color={colorTokens.staffAccentText} size={14} strokeWidth={1.8} />
              <Text numberOfLines={1} style={styles.pendingText}>
                {isPhone
                  ? formatLocalizedNumber(pendingCount, language)
                  : t("moderation.pendingReviews", {
                      count: formatLocalizedNumber(pendingCount, language),
                    })}
              </Text>
            </Pressable>
          ) : null}

          {canModerate ? (
            <Pressable
              accessibilityLabel={t("moderation.toggleLabel")}
              accessibilityRole="switch"
              accessibilityState={{ checked: armed }}
              onPress={toggle}
              style={({ pressed }) => [
                styles.switchPill,
                armed && styles.switchPillArmed,
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              {isPhone ? (
                <SlidersHorizontal
                  color={armed ? colorTokens.ink : colorTokens.onInk}
                  size={14}
                  strokeWidth={1.8}
                />
              ) : (
                <View style={[styles.switchDot, armed && styles.switchDotArmed]} />
              )}
              <Text
                numberOfLines={1}
                style={[styles.switchLabel, armed && styles.switchLabelArmed]}
              >
                {isPhone
                  ? armed
                    ? t("moderation.toolsOn")
                    : t("moderation.moderate")
                  : `${t("moderation.moderationTools")}: ${
                      armed ? t("moderation.toolsOn") : t("moderation.toolsOff")
                    }`}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityLabel={t("moderation.backToAdmin")}
            accessibilityRole="link"
            onPress={() => router.push("/admin" as never)}
            style={({ pressed }) => [
              styles.exitPill,
              pressed && styles.pressedSubtle,
              webPointer,
            ]}
          >
            <ArrowLeft color={colorTokens.onInk} size={14} strokeWidth={1.8} />
            {!isPhone ? (
              <Text numberOfLines={1} style={styles.exitText}>
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
    backgroundColor: colorTokens.ink,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.inkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  barArmed: {
    borderBottomColor: colorTokens.staffAccent,
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
  innerPhone: {
    paddingHorizontal: layout.gutterPhone,
    gap: 8,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkElevated,
    borderWidth: 1,
    borderColor: colorTokens.inkBorder,
  },
  roleText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: "capitalize",
  },
  contextTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 1,
    minWidth: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.onInkMuted,
  },
  statusDotArmed: {
    backgroundColor: colorTokens.staffAccent,
  },
  contextText: {
    color: colorTokens.onInkMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  contextTextArmed: {
    color: colorTokens.staffAccentText,
    fontFamily: fonts.semiBold,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkElevated,
    borderWidth: 1,
    borderColor: colorTokens.inkBorder,
  },
  pendingText: {
    color: colorTokens.staffAccentText,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ["tabular-nums"],
  },
  switchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkSurfaceSubtle,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    ...(Platform.select({
      web: { transition: "background-color 150ms ease, border-color 150ms ease" },
      default: {},
    }) as object),
  },
  switchPillArmed: {
    backgroundColor: colorTokens.surface,
    borderColor: colorTokens.surface,
  },
  switchDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.onInkMuted,
  },
  switchDotArmed: {
    backgroundColor: colorTokens.staffAccent,
  },
  switchLabel: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  switchLabelArmed: {
    color: colorTokens.ink,
    fontFamily: fonts.bold,
  },
  exitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkSurfaceSubtle,
    borderWidth: 1,
    borderColor: colorTokens.inkBorder,
  },
  exitText: {
    color: colorTokens.onInk,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: { opacity: 0.85 },
  pressedSubtle: { backgroundColor: colorTokens.inkBorder },
});
