import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { PlusCircle, Zap } from "@/components/icons";
import { AppLink } from "@/components/ui";
import { colorTokens, colors, fonts, radius, webPointer } from "@/theme";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";

export interface SellerWelcomeBannerProps {
  name?: string;
  activeListingsCount?: number;
  totalListingsCount?: number;
  /** While the listings load, say nothing rather than "add your first property". */
  loading?: boolean;
  onAddNewProperty?: () => void;
  onBoostListing?: () => void;
  addPropertyHref?: string;
  style?: StyleProp<ViewStyle>;
}

export function SellerWelcomeBanner({
  name = "Partner",
  activeListingsCount = 0,
  totalListingsCount = 0,
  loading = false,
  onAddNewProperty,
  onBoostListing,
  addPropertyHref = "/property/create",
  style,
}: SellerWelcomeBannerProps) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();

  const subtext = loading
    ? null
    : activeListingsCount === 1
      ? t("seller.welcomeBanner.activeListingSubOne")
      : activeListingsCount > 1
      ? t("seller.welcomeBanner.activeListingsSub", {
          count: formatLocalizedNumber(activeListingsCount, language),
        })
      : totalListingsCount > 0
      ? t("seller.welcomeBanner.draftListingsSub")
      : t("seller.welcomeBanner.noListingsSub");

  return (
    <View style={[styles.container, isPhone && styles.containerPhone, style]}>
      <View style={styles.headerLeft}>
        <Text style={styles.overlineText}>{t("seller.welcomeBanner.portal")}</Text>

        {/* "Welcome back," already ends in its comma, in both languages. */}
        <Text style={styles.title}>
          {t("dashboard.welcomeBack")} {name}
        </Text>

        {subtext ? <Text style={styles.description}>{subtext}</Text> : null}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        {addPropertyHref ? (
          <AppLink
            href={addPropertyHref}
            onPress={onAddNewProperty}
            style={[styles.primaryBtn, webPointer]}
          >
            <PlusCircle color={colorTokens.onBrand} size={16} strokeWidth={2.4} />
            <Text style={styles.primaryBtnText}>{t("dashboard.addNewProperty")}</Text>
          </AppLink>
        ) : (
          <Pressable
            onPress={onAddNewProperty}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
              webPointer,
            ]}
          >
            <PlusCircle color={colorTokens.onBrand} size={16} strokeWidth={2.4} />
            <Text style={styles.primaryBtnText}>{t("dashboard.addNewProperty")}</Text>
          </Pressable>
        )}

        {onBoostListing && (
          <Pressable
            accessibilityLabel={t("dashboard.boostListing")}
            onPress={onBoostListing}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
              webPointer,
            ]}
          >
            <Zap color={colors.ink} size={15} strokeWidth={2} />
            <Text style={styles.secondaryBtnText}>{t("dashboard.boostListing")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  containerPhone: {
    padding: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    minWidth: 260,
  },
  overlineText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.body,
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 640,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.card,
    minHeight: 40,
  },
  // Dark text on the brand green, like every other primary button (white was under 2:1).
  primaryBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.sunken,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.card,
    minHeight: 40,
  },
  secondaryBtnText: {
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  btnPressed: {
    opacity: 0.85,
  },
});
