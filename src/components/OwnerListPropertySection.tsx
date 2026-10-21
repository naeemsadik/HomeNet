import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "@/i18n";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Car,
  Check,
  Compass,
  FileCheck2,
  Home,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePropertyWizardStore } from "@/features/property/stores/propertyWizardStore";
import { AiListingSheet } from "@/features/property/components/AiListingSheet";
import type { AiParsedProperty } from "@/features/property/types/aiListing";
import { AppButton } from "@/components/ui";
import { colorTokens, colors, webPointer } from "@/theme";
import { styles } from "./OwnerListPropertySection.styles";

export type OwnerIntentId =
  | "sell_residential"
  | "rent_residential"
  | "short_let"
  | "sell_land"
  | "rent_parking"
  | "commercial_hotel";

export interface OwnerIntentOption {
  id: OwnerIntentId;
  label: string;
  badge?: string;
  icon: typeof Home;
  listingType: "sale" | "rent";
  propertyType: "residential" | "commercial" | "land" | "parking";
  subtype: string;
  description: string;
}

export const OWNER_INTENT_OPTIONS: OwnerIntentOption[] = [
  {
    id: "sell_residential",
    label: "Sell flat / house",
    icon: Home,
    listingType: "sale",
    propertyType: "residential",
    subtype: "apartment",
    description: "Apartments, duplexes, penthouses, or independent houses",
  },
  {
    id: "rent_residential",
    label: "Rent residential",
    icon: KeyRound,
    listingType: "rent",
    propertyType: "residential",
    subtype: "apartment",
    description: "Long-term rentals for families, executives, or tenants",
  },
  {
    id: "short_let",
    label: "Holiday stay",
    badge: "High demand",
    icon: CalendarCheck,
    listingType: "rent",
    propertyType: "residential",
    subtype: "short-let",
    description: "Furnished serviced flats for daily or monthly stays",
  },
  {
    id: "sell_land",
    label: "Sell plot / land",
    icon: Compass,
    listingType: "sale",
    propertyType: "land",
    subtype: "residential-plot",
    description: "Verified residential, commercial, or agricultural plots",
  },
  {
    id: "rent_parking",
    label: "Rent garage / parking",
    icon: Car,
    listingType: "rent",
    propertyType: "parking",
    subtype: "garage",
    description: "Monetize vacant residential or commercial parking slots",
  },
  {
    id: "commercial_hotel",
    label: "Commercial / hotel",
    icon: Building2,
    listingType: "sale",
    propertyType: "commercial",
    subtype: "office",
    description: "Offices, retail stores, hotel floors, or warehouse units",
  },
];

export function OwnerListPropertySection() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const requireAuth = useRequireAuth();
  const setWizardBasics = usePropertyWizardStore((s) => s.setBasics);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntentId, setSelectedIntentId] = useState<OwnerIntentId>("sell_residential");
  const [hoveredIntentId, setHoveredIntentId] = useState<OwnerIntentId | null>(null);
  const [aiSheetVisible, setAiSheetVisible] = useState(false);

  const ownerIntentOptions: OwnerIntentOption[] = useMemo(() => [
    {
      id: "sell_residential",
      label: t("search.ownerSection.intents.sellResidentialLabel"),
      icon: Home,
      listingType: "sale",
      propertyType: "residential",
      subtype: "apartment",
      description: t("search.ownerSection.intents.sellResidentialDesc"),
    },
    {
      id: "rent_residential",
      label: t("search.ownerSection.intents.rentResidentialLabel"),
      icon: KeyRound,
      listingType: "rent",
      propertyType: "residential",
      subtype: "apartment",
      description: t("search.ownerSection.intents.rentResidentialDesc"),
    },
    {
      id: "short_let",
      label: t("search.ownerSection.intents.shortLetLabel"),
      badge: t("search.ownerSection.intents.shortLetBadge"),
      icon: CalendarCheck,
      listingType: "rent",
      propertyType: "residential",
      subtype: "short-let",
      description: t("search.ownerSection.intents.shortLetDesc"),
    },
    {
      id: "sell_land",
      label: t("search.ownerSection.intents.sellLandLabel"),
      icon: Compass,
      listingType: "sale",
      propertyType: "land",
      subtype: "residential-plot",
      description: t("search.ownerSection.intents.sellLandDesc"),
    },
    {
      id: "rent_parking",
      label: t("search.ownerSection.intents.rentParkingLabel"),
      icon: Car,
      listingType: "rent",
      propertyType: "parking",
      subtype: "garage",
      description: t("search.ownerSection.intents.rentParkingDesc"),
    },
    {
      id: "commercial_hotel",
      label: t("search.ownerSection.intents.commercialHotelLabel"),
      icon: Building2,
      listingType: "sale",
      propertyType: "commercial",
      subtype: "office",
      description: t("search.ownerSection.intents.commercialHotelDesc"),
    },
  ], [t]);

  const handleAiApply = (data: AiParsedProperty) => {
    // Hydrate zustand wizard store
    const store = usePropertyWizardStore.getState();
    store.setBasics({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.subtype !== undefined ? { subtype: data.subtype } : {}),
      ...(data.listingType !== undefined ? { listingType: data.listingType } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.areaSize !== undefined ? { areaSize: data.areaSize } : {}),
      ...(data.areaUnit !== undefined ? { areaUnit: data.areaUnit } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
    });
    store.setDetails({
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.areaSize !== undefined ? { areaSize: data.areaSize } : {}),
      ...(data.areaUnit !== undefined ? { areaUnit: data.areaUnit } : {}),
      ...(data.bedrooms !== undefined ? { bedrooms: data.bedrooms } : {}),
      ...(data.bathrooms !== undefined ? { bathrooms: data.bathrooms } : {}),
      ...(data.floor !== undefined ? { floor: data.floor } : {}),
      ...(data.facing !== undefined ? { facing: data.facing } : {}),
    });
    store.setLocation({
      ...(data.address !== undefined ? { address: data.address } : {}),
    });
    if (data.amenities) {
      store.setAmenities({ ...store.amenities, ...data.amenities });
    }

    setAiSheetVisible(false);
    setIsModalOpen(false);

    // Navigate to wizard gated behind requireAuth
    requireAuth(() => {
      const queryParams = new URLSearchParams();
      if (data.listingType) queryParams.set("listing_type", data.listingType);
      if (data.type) queryParams.set("type", data.type);
      if (data.subtype) queryParams.set("subtype", data.subtype);
      const queryString = queryParams.toString();
      const targetUrl = `/property/create${queryString ? `?${queryString}` : ""}`;
      router.push(targetUrl as any);
    });
  };

  const selectedIntent =
    ownerIntentOptions.find((item) => item.id === selectedIntentId) ?? ownerIntentOptions[0];

  const handleOpenStudio = () => {
    setIsModalOpen(true);
  };

  const handleProceedWithIntent = (intentToUse = selectedIntent) => {
    setIsModalOpen(false);

    // Sync to zustand store
    setWizardBasics({
      type: intentToUse.propertyType,
      listingType: intentToUse.listingType,
      subtype: intentToUse.subtype,
    });

    const targetUrl = `/property/create?listing_type=${intentToUse.listingType}&type=${intentToUse.propertyType}&subtype=${encodeURIComponent(
      intentToUse.subtype
    )}`;

    // Gate navigation behind login
    requireAuth(() => {
      router.push(targetUrl as any);
    });
  };

  const handleSecondarySellerDashboard = () => {
    requireAuth(() => {
      router.push("/seller" as any);
    });
  };

  const handleTertiaryEstimate = () => {
    router.push("/sell" as any);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          CLEAN LANDING PAGE SECTION (BREATHABLE, UNCLUTTERED)
      ───────────────────────────────────────────────────────────── */}
      <View
        accessibilityLabel={t("search.ownerSection.regionAria")}
        // @ts-ignore web role
        role="region"
        // @ts-ignore web-standard aria attribute
        aria-labelledby="owner-section-heading"
        style={styles.outerContainer}
      >
        <View style={styles.maxWidthWrapper}>
          <View style={[styles.cleanCard, isPhone && styles.cleanCardPhone]}>
            <View
              style={[
                styles.cardLayout,
                (isTablet || isPhone) && styles.cardLayoutStacked,
              ]}
            >
              {/* Copy & CTAs */}
              <View style={[styles.mainCopyWrap, isPhone && styles.mainCopyWrapPhone]}>
                {/* Eyebrow */}
                <View style={styles.eyebrowContainer}>
                  <View style={styles.eyebrowBadge}>
                    <Text style={styles.eyebrowText}>{t("search.ownerSection.eyebrow")}</Text>
                  </View>
                </View>

                {/* Headline */}
                <Text
                  accessibilityRole="header"
                  id="owner-section-heading"
                  style={[styles.headline, isPhone && styles.headlinePhone]}
                >
                  {t("search.ownerSection.headline")}
                </Text>

                {/* Subcopy */}
                <Text style={[styles.subcopy, isPhone && styles.subcopyPhone]}>
                  {t("search.ownerSection.subcopy")}
                </Text>

                {/* Clean CTAs Row */}
                <View style={[styles.ctaRow, isPhone && styles.ctaRowPhone]}>
                  <AppButton
                    label={t("search.ownerSection.startListing")}
                    onPress={handleOpenStudio}
                    trailingIcon={ArrowRight}
                    style={isPhone && styles.fullWidthButton}
                  />

                  <AppButton
                    label={t("search.ownerSection.sellerDashboard")}
                    onPress={handleSecondarySellerDashboard}
                    icon={LayoutDashboard}
                    variant="secondary"
                    style={isPhone && styles.fullWidthButton}
                  />

                  <AppButton
                    label={t("search.ownerSection.freeEstimate")}
                    onPress={handleTertiaryEstimate}
                    icon={TrendingUp}
                    variant="ghost"
                  />
                </View>

                {/* Clean Micro-Trust Points */}
                {isPhone ? (
                  <View style={styles.trustPillsPhoneWrap}>
                    <View style={styles.trustPillsTopRowPhone}>
                      <View style={styles.trustPillItem}>
                        <ShieldCheck color="#04cf92" size={14} />
                        <Text style={styles.trustPillText}>{t("search.ownerSection.trustVerified")}</Text>
                      </View>
                      <View style={styles.trustDot} />
                      <View style={styles.trustPillItem}>
                        <FileCheck2 color="#04cf92" size={14} />
                        <Text style={styles.trustPillText}>{t("search.ownerSection.trustGuided")}</Text>
                      </View>
                    </View>
                    <View style={styles.trustPillCenterPhone}>
                      <View style={styles.trustPillItem}>
                        <Sparkles color="#F4823A" size={14} />
                        <Text style={styles.trustPillText}>{t("search.ownerSection.trustFree")}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.trustPillsRow}>
                    <View style={styles.trustPillItem}>
                      <ShieldCheck color="#04cf92" size={15} />
                      <Text style={styles.trustPillText}>{t("search.ownerSection.trustVerified")}</Text>
                    </View>
                    <View style={styles.trustDot} />
                    <View style={styles.trustPillItem}>
                      <FileCheck2 color="#04cf92" size={15} />
                      <Text style={styles.trustPillText}>{t("search.ownerSection.trustGuided")}</Text>
                    </View>
                    <View style={styles.trustDot} />
                    <View style={styles.trustPillItem}>
                      <Sparkles color="#F4823A" size={14} />
                      <Text style={styles.trustPillText}>{t("search.ownerSection.trustFree")}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Minimalist Graphic Panel (Clean Brand Art / Stat Highlights) */}
              <View style={[styles.visualSideWrap, isPhone && styles.visualSideWrapPhone]}>
                <View style={styles.aestheticPlaque}>
                  <View style={styles.plaqueHeader}>
                    <View style={styles.plaqueIconWrap}>
                      <BadgeCheck color="#04cf92" size={24} />
                    </View>
                    <View>
                      <Text style={styles.plaqueTitle}>{t("search.ownerSection.hubTitle")}</Text>
                      <Text style={styles.plaqueSubtitle}>{t("search.ownerSection.hubSubtitle")}</Text>
                    </View>
                  </View>

                  <View style={styles.plaqueStatsRow}>
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>{t("search.ownerSection.statVerifiedNum")}</Text>
                      <Text style={styles.plaqueStatLabel}>{t("search.ownerSection.statVerifiedLabel")}</Text>
                    </View>
                    <View style={styles.plaqueDivider} />
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>{t("search.ownerSection.statZeroNum")}</Text>
                      <Text style={styles.plaqueStatLabel}>{t("search.ownerSection.statZeroLabel")}</Text>
                    </View>
                    <View style={styles.plaqueDivider} />
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>{t("search.ownerSection.statDirectNum")}</Text>
                      <Text style={styles.plaqueStatLabel}>{t("search.ownerSection.statDirectLabel")}</Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityLabel={t("search.ownerSection.startListingAria")}
                    onPress={handleOpenStudio}
                    style={({ pressed }) => [
                      styles.plaqueActionRow,
                      pressed && styles.buttonPressed,
                      webPointer,
                    ]}
                  >
                    <Text style={styles.plaqueActionText}>{t("search.ownerSection.exploreCategories")}</Text>
                    <ArrowRight color="#04cf92" size={14} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          FOCUSED OWNER STUDIO MODAL (ACTIVATED ON "START LISTING")
      ───────────────────────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
        transparent
        visible={isModalOpen}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel={t("search.ownerSection.closeModalOverlay")}
            onPress={() => setIsModalOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.modalCard, isPhone && styles.modalCardPhone]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.modalEyebrowRow}>
                  <Sparkles color="#04cf92" size={14} />
                  <Text style={styles.modalEyebrow}>{t("search.ownerSection.modalEyebrow")}</Text>
                </View>
                <Text style={styles.modalTitle}>{t("search.ownerSection.modalTitle")}</Text>
                <Text style={styles.modalSubtitle}>
                  {t("search.ownerSection.modalSubtitle")}
                </Text>
              </View>

              <Pressable
                accessibilityLabel={t("search.ownerSection.closeDialog")}
                accessibilityRole="button"
                onPress={() => setIsModalOpen(false)}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.buttonPressed,
                  webPointer,
                ]}
              >
                <X color={colors.ink} size={20} />
              </Pressable>
            </View>

            {/* AI Entry Card — directly under Select what you want to list / Choose your property type */}
            <Pressable
              accessibilityHint={t("search.ownerSection.skipWithAiHint")}
              accessibilityLabel={t("search.ownerSection.skipWithAiAria")}
              accessibilityRole="button"
              onPress={() => setAiSheetVisible(true)}
              style={({ pressed }) => [
                styles.aiEntryCard,
                isPhone && styles.aiEntryCardPhone,
                pressed && styles.buttonPressed,
                webPointer,
              ]}
            >
              <View style={[styles.aiCardLeft, isPhone && styles.aiCardLeftPhone]}>
                <View style={styles.aiIconGlowingWrap}>
                  <Sparkles color="#04cf92" size={20} strokeWidth={2.2} />
                </View>
                <View style={styles.aiTextContainer}>
                  <View style={styles.aiHeadlineRow}>
                    <Text style={styles.aiHeadline}>
                      {t("search.ownerSection.skipWithAiTitle")}
                    </Text>
                    <View style={styles.aiBetaBadge}>
                      <Text style={styles.aiBetaText}>BETA</Text>
                    </View>
                  </View>
                  <Text style={styles.aiSubtext}>
                    {t("search.ownerSection.skipWithAiSub")}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.aiCtaButton,
                  isPhone && styles.aiCtaButtonPhone,
                ]}
              >
                <Sparkles color={colorTokens.onBrand} size={15} strokeWidth={2.2} />
                <Text style={styles.aiCtaButtonText}>{t("search.ownerSection.listWithAi")}</Text>
                <ArrowRight color={colorTokens.onBrand} size={15} strokeWidth={2.2} />
              </View>
            </Pressable>

            {/* Modal Content: 6 Intent Cards */}
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: isPhone ? 300 : 340 }}
            >
              <View style={styles.modalGrid}>
                {ownerIntentOptions.map((intent) => {
                  const isSelected = intent.id === selectedIntentId;
                  const isHovered = intent.id === hoveredIntentId;
                  const IntentIcon = intent.icon;

                  return (
                    <Pressable
                      key={intent.id}
                      accessibilityLabel={`${intent.label}, ${intent.description}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedIntentId(intent.id)}
                      // @ts-ignore web hover
                      onMouseEnter={() => setHoveredIntentId(intent.id)}
                      // @ts-ignore web hover
                      onMouseLeave={() => setHoveredIntentId(null)}
                      style={({ pressed }) => [
                        styles.intentCard,
                        isSelected && styles.intentCardSelected,
                        !isSelected && isHovered && styles.intentCardHovered,
                        pressed && styles.buttonPressed,
                        webPointer,
                      ]}
                    >
                      <View style={styles.intentCardTop}>
                        <View
                          style={[
                            styles.intentCardIconWrap,
                            isSelected && styles.intentCardIconWrapSelected,
                          ]}
                        >
                          <IntentIcon
                            color={isSelected ? "#04cf92" : "#5C6B66"}
                            size={20}
                          />
                        </View>
                        {isSelected ? (
                          <View style={styles.checkCircleSelected}>
                            <Check color={colorTokens.onBrand} size={12} strokeWidth={3} />
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.intentCardContent}>
                        <View style={styles.intentCardTitleRow}>
                          <Text
                            style={[
                              styles.intentCardTitle,
                              isSelected && styles.intentCardTitleSelected,
                            ]}
                          >
                            {intent.label}
                          </Text>
                          {intent.badge ? (
                            <View style={styles.intentBadgePill}>
                              <Text style={styles.intentBadgeText}>{intent.badge}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.intentCardDesc}>{intent.description}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <View style={styles.modalFooterHint}>
                <ShieldCheck color="#04cf92" size={16} />
                <Text style={styles.modalFooterHintText}>
                  {t("search.ownerSection.modalFooterHint")}
                </Text>
              </View>

              <View style={styles.modalFooterActions}>
                <Pressable
                  accessibilityLabel={t("search.ownerSection.cancelAria")}
                  onPress={() => setIsModalOpen(false)}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                    webPointer,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>{t("search.ownerSection.cancel")}</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel={t("search.ownerSection.continueWithAria", { label: selectedIntent.label })}
                  accessibilityRole="button"
                  onPress={() => handleProceedWithIntent(selectedIntent)}
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed && styles.buttonPressed,
                    webPointer,
                  ]}
                >
                  <Text style={styles.continueButtonText}>
                    {t("search.ownerSection.continueWith", { label: selectedIntent.label })}
                  </Text>
                  <ArrowRight color={colorTokens.onBrand} size={16} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <AiListingSheet
        visible={aiSheetVisible}
        onClose={() => setAiSheetVisible(false)}
        onApply={handleAiApply}
        onUseManualForm={() => setIsModalOpen(true)}
      />
    </>
  );
}
