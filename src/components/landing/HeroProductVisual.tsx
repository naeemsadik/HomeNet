import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Mail,
  MapPin,
  Search,
  ShieldCheck,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { cdnImage } from "@/lib/cloudinaryImage";
import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame } from "./PhoneFrame";
import { previewProperties } from "@/data/landingPreview";
import { PropertyCard } from "@/components/PropertyCard";

interface PhoneDetailPreviewProps {
  imageUrl?: string;
  title: string;
  location: string;
  verifiedLabel: string;
  contactLabel: string;
}

/** Shared phone mockup preview rendered in both the desktop overlap and mobile view. */
function PhoneDetailPreview({
  imageUrl,
  title,
  location,
  verifiedLabel,
  contactLabel,
}: PhoneDetailPreviewProps) {
  return (
    <View style={styles.mobileDetailPreview}>
      <View style={styles.mobileDetailImageWrap}>
        <Image
          accessibilityLabel={title}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: cdnImage(imageUrl, 640, 280) }}
          style={styles.mobileDetailImage}
        />
        <View style={styles.mobileDetailBadge}>
          <ShieldCheck color={colorTokens.info} size={12} strokeWidth={2.5} />
          <Text style={styles.mobileDetailBadgeText}>{verifiedLabel}</Text>
        </View>
      </View>

      <View style={styles.mobileDetailBody}>
        <Text numberOfLines={1} style={styles.mobileDetailLocation}>
          {location}
        </Text>
        <Text numberOfLines={1} style={styles.mobileDetailTitle}>
          {title}
        </Text>
        <Text style={styles.mobileDetailPrice}>৳4.85 Crore</Text>

        <View style={styles.mobileContactBtn} testID="hero-contact-cta">
          <Mail color={colorTokens.onBrand} size={13} strokeWidth={2} />
          <Text style={styles.mobileContactBtnText} testID="hero-contact-cta-text">
            {contactLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function HeroProductVisual() {
  const { t } = useTranslation();
  const { isPhone, isCompact, isLargeScreen, isTall } = useResponsive();

  const handleOpenApp = () => {
    router.push("/buy" as any);
  };

  const p1 = previewProperties[0];
  const p2 = previewProperties[1];

  return (
    <Pressable
      onPress={handleOpenApp}
      accessibilityRole="link"
      accessibilityLabel={t("landing.heroVisual.openAppAria")}
      style={({ pressed }) => [
        styles.container,
        (isLargeScreen || isTall) && styles.containerLarge,
        pressed && styles.containerPressed,
        webPointer,
      ]}
    >
      {/* On desktop and tablet: full browser frame with phone overlay */}
      {!isPhone ? (
        <View style={[styles.compositionWrap, isLargeScreen && styles.compositionWrapLarge]}>
          {/* Main Desktop Browser Frame */}
          <BrowserFrame
            url={t("landing.browserFrame.dhakaUrl")}
            style={[
              styles.browserFrame,
              isCompact && styles.browserFrameCompact,
              isLargeScreen && styles.browserFrameLarge,
            ]}
            contentStyle={styles.browserBody}
          >
            {/* Decorative Search Bar Replica */}
            <View style={styles.searchReplicaBar}>
              <View style={styles.searchReplicaInput}>
                <Search color={colorTokens.muted} size={16} strokeWidth={2} />
                <Text numberOfLines={1} style={styles.searchReplicaPlaceholder}>
                  {t("landing.heroVisual.searchPlaceholder")}
                </Text>
              </View>
              <View style={styles.searchReplicaAreaBtn}>
                <MapPin color={colorTokens.brandText} size={14} strokeWidth={2} />
                <Text style={styles.searchReplicaAreaText}>{t("landing.heroVisual.city")}</Text>
              </View>
              <View style={styles.searchReplicaBtn} testID="hero-search-cta">
                <Text style={styles.searchReplicaBtnText} testID="hero-search-cta-text">
                  {t("landing.heroVisual.searchBtn")}
                </Text>
              </View>
            </View>

            {/* Two Live Property Cards */}
            <View style={styles.cardsRow}>
              <View style={styles.cardCol}>
                <PropertyCard
                  decorative property={p1} onPress={handleOpenApp} />
              </View>
              <View style={styles.cardCol}>
                <PropertyCard
                  decorative property={p2} onPress={handleOpenApp} />
              </View>
            </View>
          </BrowserFrame>

          {/* Overlapping Phone Frame (Detail View) */}
          <View style={styles.phoneOverlapWrap}>
            <PhoneFrame style={styles.phoneFrame}>
              <PhoneDetailPreview
                contactLabel={t("landing.heroVisual.contactDirect")}
                imageUrl={p1.media?.[0]?.url}
                location="Road 92, Gulshan-2"
                title={p1.title}
                verifiedLabel={t("landing.heroVisual.verifiedBadge")}
              />
            </PhoneFrame>
          </View>
        </View>
      ) : (
        /* Mobile Only: Focused Single Phone Frame Preview */
        <View style={styles.mobileVisualWrap}>
          <PhoneFrame style={styles.mobileStandalonePhone}>
            <PhoneDetailPreview
              contactLabel={t("landing.heroVisual.contactDirect")}
              imageUrl={p1.media?.[0]?.url}
              location="Road 92, Gulshan-2, Dhaka"
              title={p1.title}
              verifiedLabel={t("landing.heroVisual.verifiedBadge")}
            />
          </PhoneFrame>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  containerLarge: {
    marginTop: 44,
  },
  containerPressed: {
    opacity: 0.96,
  },
  compositionWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 920,
    alignItems: "center",
  },
  compositionWrapLarge: {
    maxWidth: 1080,
  },
  browserFrame: {
    width: "100%",
    maxWidth: 860,
  },
  browserFrameLarge: {
    maxWidth: 1020,
  },
  browserFrameCompact: {
    maxWidth: 740,
  },
  browserBody: {
    padding: 18,
    backgroundColor: colorTokens.canvas,
  },
  searchReplicaBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorTokens.surface,
    padding: 6,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colorTokens.border,
    marginBottom: 16,
  },
  searchReplicaInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  searchReplicaPlaceholder: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  searchReplicaAreaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  searchReplicaAreaText: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  searchReplicaBtn: {
    backgroundColor: colorTokens.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  searchReplicaBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 16,
  },
  cardCol: {
    flex: 1,
  },
  phoneOverlapWrap: {
    position: "absolute",
    right: -14,
    bottom: -24,
    zIndex: 10,
    transform: [{ rotate: "1.5deg" }],
  },
  phoneFrame: {
    width: 250,
  },
  mobileVisualWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  mobileStandalonePhone: {
    width: "100%",
    maxWidth: 320,
  },
  mobileDetailPreview: {
    backgroundColor: colorTokens.surface,
    paddingBottom: 14,
  },
  mobileDetailImageWrap: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  mobileDetailImage: {
    width: "100%",
    height: "100%",
  },
  mobileDetailBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colorTokens.infoSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  mobileDetailBadgeText: {
    color: colorTokens.info,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: "600",
  },
  mobileDetailBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 4,
  },
  mobileDetailLocation: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  mobileDetailTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 13.5,
    fontWeight: "700",
  },
  mobileDetailPrice: {
    color: colorTokens.brandText,
    fontFamily: fonts.headingExtraBold,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  mobileContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colorTokens.brand,
    paddingVertical: 8,
    borderRadius: radius.lg,
    marginTop: 8,
  },
  mobileContactBtnText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 11.5,
    fontWeight: "700",
  },
});
