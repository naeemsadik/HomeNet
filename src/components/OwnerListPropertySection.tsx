import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
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
} from "lucide-react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePropertyWizardStore } from "@/features/property/stores/propertyWizardStore";
import { colors, fonts, webPointer } from "@/theme";

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
    label: "Short let",
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
  const { isPhone, isTablet } = useResponsive();
  const requireAuth = useRequireAuth();
  const setWizardBasics = usePropertyWizardStore((s) => s.setBasics);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntentId, setSelectedIntentId] = useState<OwnerIntentId>("sell_residential");
  const [hoveredIntentId, setHoveredIntentId] = useState<OwnerIntentId | null>(null);
  const [hoveredCta, setHoveredCta] = useState<"primary" | "secondary" | "tertiary" | null>(null);

  const selectedIntent =
    OWNER_INTENT_OPTIONS.find((item) => item.id === selectedIntentId) ?? OWNER_INTENT_OPTIONS[0];

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
        accessibilityLabel="Property owner listing section"
        // @ts-ignore web role
        role="region"
        // @ts-ignore web-standard aria attribute
        aria-labelledby="owner-section-heading"
        style={styles.outerContainer}
      >
        <View style={styles.maxWidthWrapper}>
          <View style={[styles.cleanCard, isPhone && styles.cleanCardPhone]}>
            {/* Subtle aesthetic backdrop glow */}
            <View pointerEvents="none" style={styles.glowTopRight} />

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
                    <Sparkles color="#04cf92" size={13} />
                    <Text style={styles.eyebrowText}>For owners</Text>
                  </View>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>Free to start</Text>
                  </View>
                </View>

                {/* Headline */}
                <Text
                  accessibilityRole="header"
                  id="owner-section-heading"
                  style={[styles.headline, isPhone && styles.headlinePhone]}
                >
                  List your property
                </Text>

                {/* Subcopy */}
                <Text style={[styles.subcopy, isPhone && styles.subcopyPhone]}>
                  Sell, rent, or short-let with confidence. List flats, houses, plots,
                  garages, parking spaces, or commercial units across Bangladesh — completely
                  free to start.
                </Text>

                {/* Clean CTAs Row */}
                <View style={[styles.ctaRow, isPhone && styles.ctaRowPhone]}>
                  <Pressable
                    accessibilityHint="Opens the property type selection studio to start listing"
                    accessibilityLabel="Start listing"
                    accessibilityRole="button"
                    onPress={handleOpenStudio}
                    // @ts-ignore web hover
                    onMouseEnter={() => setHoveredCta("primary")}
                    // @ts-ignore web hover
                    onMouseLeave={() => setHoveredCta(null)}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      hoveredCta === "primary" && styles.primaryButtonHovered,
                      pressed && styles.buttonPressed,
                      isPhone && styles.fullWidthButton,
                      webPointer,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>Start listing</Text>
                    <ArrowRight color="#FFFFFF" size={16} />
                  </Pressable>

                  <Pressable
                    accessibilityHint="Opens your seller dashboard"
                    accessibilityLabel="Seller dashboard"
                    accessibilityRole="button"
                    onPress={handleSecondarySellerDashboard}
                    // @ts-ignore web hover
                    onMouseEnter={() => setHoveredCta("secondary")}
                    // @ts-ignore web hover
                    onMouseLeave={() => setHoveredCta(null)}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      hoveredCta === "secondary" && styles.secondaryButtonHovered,
                      pressed && styles.buttonPressed,
                      isPhone && styles.fullWidthButton,
                      webPointer,
                    ]}
                  >
                    <LayoutDashboard color={colors.ink} size={16} />
                    <Text style={styles.secondaryButtonText}>Seller dashboard</Text>
                  </Pressable>

                  <Pressable
                    accessibilityHint="Get a free property valuation"
                    accessibilityLabel="Get a free estimate"
                    accessibilityRole="link"
                    onPress={handleTertiaryEstimate}
                    // @ts-ignore web hover
                    onMouseEnter={() => setHoveredCta("tertiary")}
                    // @ts-ignore web hover
                    onMouseLeave={() => setHoveredCta(null)}
                    style={({ pressed }) => [
                      styles.tertiaryLink,
                      hoveredCta === "tertiary" && styles.tertiaryLinkHovered,
                      pressed && styles.buttonPressed,
                      isPhone && styles.tertiaryLinkPhone,
                      webPointer,
                    ]}
                  >
                    <TrendingUp color="#2251D6" size={15} />
                    <Text style={styles.tertiaryLinkText}>Get a free estimate</Text>
                  </Pressable>
                </View>

                {/* Clean Micro-Trust Points */}
                <View style={styles.trustPillsRow}>
                  <View style={styles.trustPillItem}>
                    <ShieldCheck color="#04cf92" size={15} />
                    <Text style={styles.trustPillText}>Verified buyers & tenants</Text>
                  </View>
                  <View style={styles.trustDot} />
                  <View style={styles.trustPillItem}>
                    <FileCheck2 color="#04cf92" size={15} />
                    <Text style={styles.trustPillText}>Guided 5-step listing</Text>
                  </View>
                  <View style={styles.trustDot} />
                  <View style={styles.trustPillItem}>
                    <Sparkles color="#F4823A" size={14} />
                    <Text style={styles.trustPillText}>0 BDT listing fee</Text>
                  </View>
                </View>
              </View>

              {/* Minimalist Graphic Panel (Clean Brand Art / Stat Highlights) */}
              <View style={[styles.visualSideWrap, isPhone && styles.visualSideWrapPhone]}>
                <View style={styles.aestheticPlaque}>
                  <View style={styles.plaqueHeader}>
                    <View style={styles.plaqueIconWrap}>
                      <BadgeCheck color="#04cf92" size={24} />
                    </View>
                    <View>
                      <Text style={styles.plaqueTitle}>HomeNet Owner Hub</Text>
                      <Text style={styles.plaqueSubtitle}>Direct inquiries • No broker spam</Text>
                    </View>
                  </View>

                  <View style={styles.plaqueStatsRow}>
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>12.4k+</Text>
                      <Text style={styles.plaqueStatLabel}>Active Seekers</Text>
                    </View>
                    <View style={styles.plaqueDivider} />
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>0 BDT</Text>
                      <Text style={styles.plaqueStatLabel}>Upfront Cost</Text>
                    </View>
                    <View style={styles.plaqueDivider} />
                    <View style={styles.plaqueStatItem}>
                      <Text style={styles.plaqueStatNum}>24h</Text>
                      <Text style={styles.plaqueStatLabel}>Verification</Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityLabel="Start listing now"
                    onPress={handleOpenStudio}
                    style={({ pressed }) => [
                      styles.plaqueActionRow,
                      pressed && styles.buttonPressed,
                      webPointer,
                    ]}
                  >
                    <Text style={styles.plaqueActionText}>Explore listing categories</Text>
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
            accessibilityLabel="Close modal overlay"
            onPress={() => setIsModalOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.modalCard, isPhone && styles.modalCardPhone]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.modalEyebrowRow}>
                  <Sparkles color="#04cf92" size={14} />
                  <Text style={styles.modalEyebrow}>Owner Studio</Text>
                </View>
                <Text style={styles.modalTitle}>Select what you want to list</Text>
                <Text style={styles.modalSubtitle}>
                  Choose your property type to customize your 5-step listing workflow.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close dialog"
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

            {/* Modal Content: 6 Intent Cards */}
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 440 }}
            >
              <View style={styles.modalGrid}>
                {OWNER_INTENT_OPTIONS.map((intent) => {
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
                            <Check color="#FFFFFF" size={12} strokeWidth={3} />
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
                  Free to publish • Direct verified inquiries
                </Text>
              </View>

              <View style={styles.modalFooterActions}>
                <Pressable
                  accessibilityLabel="Cancel selection"
                  onPress={() => setIsModalOpen(false)}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                    webPointer,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel={`Continue listing ${selectedIntent.label}`}
                  accessibilityRole="button"
                  onPress={() => handleProceedWithIntent(selectedIntent)}
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed && styles.buttonPressed,
                    webPointer,
                  ]}
                >
                  <Text style={styles.continueButtonText}>
                    Continue with {selectedIntent.label}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={16} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  maxWidthWrapper: {
    width: "100%",
    maxWidth: 1200,
  },
  cleanCard: {
    position: "relative",
    backgroundColor: "#F8FAF9",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    paddingHorizontal: 40,
    paddingVertical: 36,
    overflow: "hidden",
    ...(Platform.select({
      web: {
        boxShadow: "0 10px 30px rgba(11, 26, 23, 0.03)",
      },
      default: {
        shadowColor: "#0B1A17",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
        elevation: 2,
      },
    }) as any),
  },
  cleanCardPhone: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
  },
  glowTopRight: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#E6FAF4",
    opacity: 0.6,
  },
  cardLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
  },
  cardLayoutStacked: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 28,
  },
  mainCopyWrap: {
    flex: 1.25,
    maxWidth: 680,
  },
  mainCopyWrapPhone: {
    maxWidth: "100%",
  },
  eyebrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  eyebrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: "#E6FAF4",
    borderWidth: 1,
    borderColor: "rgba(4, 207, 146, 0.25)",
  },
  eyebrowText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: "rgba(11, 26, 23, 0.05)",
  },
  freeBadgeText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  headline: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  headlinePhone: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.4,
  },
  subcopy: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  subcopyPhone: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  ctaRowPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 18,
  },
  fullWidthButton: {
    width: "100%",
    justifyContent: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: "#04cf92",
    ...(Platform.select({
      web: {
        boxShadow: "0 4px 14px rgba(4, 207, 146, 0.3)",
        transition: "all 0.18s ease",
      },
      default: {},
    }) as any),
  },
  primaryButtonHovered: {
    backgroundColor: "#03b57f",
    ...(Platform.select({
      web: {
        boxShadow: "0 6px 18px rgba(4, 207, 146, 0.4)",
      },
      default: {},
    }) as any),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.12)",
    ...(Platform.select({
      web: {
        transition: "all 0.18s ease",
      },
      default: {},
    }) as any),
  },
  secondaryButtonHovered: {
    backgroundColor: "#F0F4F2",
    borderColor: "rgba(11, 26, 23, 0.22)",
  },
  secondaryButtonText: {
    color: "#0B1A17",
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  tertiaryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tertiaryLinkPhone: {
    justifyContent: "center",
  },
  tertiaryLinkHovered: {
    opacity: 0.8,
  },
  tertiaryLinkText: {
    color: "#2251D6",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  trustPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.06)",
  },
  trustPillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustPillText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(11, 26, 23, 0.2)",
  },
  visualSideWrap: {
    flex: 0.8,
    minWidth: 280,
  },
  visualSideWrapPhone: {
    minWidth: "100%",
  },
  aestheticPlaque: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
    ...(Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(11, 26, 23, 0.04)",
      },
      default: {},
    }) as any),
  },
  plaqueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  plaqueIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E6FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  plaqueTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  plaqueSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  plaqueStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.05)",
  },
  plaqueStatItem: {
    alignItems: "center",
    flex: 1,
  },
  plaqueStatNum: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  plaqueStatLabel: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },
  plaqueDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(11, 26, 23, 0.08)",
  },
  plaqueActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  plaqueActionText: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  // ─── Modal Styles ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 26, 23, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    maxHeight: "90%",
    ...(Platform.select({
      web: {
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
      },
      default: {
        elevation: 8,
      },
    }) as any),
  },
  modalCardPhone: {
    padding: 18,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 26, 23, 0.06)",
  },
  modalEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  modalEyebrow: {
    color: "#04cf92",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalTitle: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  modalSubtitle: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 26, 23, 0.05)",
  },
  modalScrollContent: {
    paddingVertical: 4,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  intentCard: {
    flex: 1,
    minWidth: 280,
    flexBasis: "48%",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    padding: 16,
    ...(Platform.select({
      web: {
        transition: "all 0.16s ease",
      },
      default: {},
    }) as any),
  },
  intentCardHovered: {
    borderColor: "rgba(4, 207, 146, 0.4)",
    backgroundColor: "#F3FCF9",
  },
  intentCardSelected: {
    borderColor: "#04cf92",
    backgroundColor: "#E6FAF4",
    ...(Platform.select({
      web: {
        boxShadow: "0 2px 10px rgba(4, 207, 146, 0.15)",
      },
      default: {},
    }) as any),
  },
  intentCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  intentCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  intentCardIconWrapSelected: {
    backgroundColor: "rgba(4, 207, 146, 0.15)",
  },
  checkCircleSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
  },
  intentCardContent: {
    gap: 4,
  },
  intentCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  intentCardTitle: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  intentCardTitleSelected: {
    color: "#0B1A17",
    fontFamily: fonts.bold,
  },
  intentBadgePill: {
    backgroundColor: "#FDEEE2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  intentBadgeText: {
    color: "#D96A24",
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  intentCardDesc: {
    color: "#5C6B66",
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 26, 23, 0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  modalFooterHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalFooterHintText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  modalFooterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#5C6B66",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#04cf92",
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...(Platform.select({
      web: {
        boxShadow: "0 3px 10px rgba(4, 207, 146, 0.3)",
      },
      default: {},
    }) as any),
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
