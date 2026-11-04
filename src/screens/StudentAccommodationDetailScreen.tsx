import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Check,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  X,
} from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  useTranslation,
} from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  getAccommodationDetail,
  revealContact as apiRevealContact,
  toggleSave as apiToggleSave,
} from "@/api/studentAccommodationApi";
import type {
  MediaLabel,
  StudentAccommodationDetail,
} from "@/types/studentAccommodation";

export interface StudentAccommodationDetailScreenProps {
  accommodation?: StudentAccommodationDetail;
  id?: string;
  onBack?: () => void;
  onContactRevealed?: (
    channels: NonNullable<StudentAccommodationDetail["contact_channels"]>,
  ) => void;
  style?: StyleProp<ViewStyle>;
}

type GalleryTab = "all" | MediaLabel;

const GALLERY_TABS: Array<{ key: GalleryTab; labelKey: string }> = [
  { key: "all", labelKey: "studentAccommodation.allPhotos" },
  { key: "room", labelKey: "studentAccommodation.room" },
  { key: "washroom", labelKey: "studentAccommodation.washroom" },
  { key: "building", labelKey: "studentAccommodation.building" },
  { key: "kitchen", labelKey: "studentAccommodation.kitchen" },
  { key: "common_area", labelKey: "studentAccommodation.common_area" },
];

function getGenderPolicyStyle(policy?: string) {
  switch (policy) {
    case "male":
      return {
        bg: colorTokens.infoSurface,
        text: colorTokens.info,
        border: "rgba(34, 81, 214, 0.2)",
      };
    case "female":
      return {
        bg: colorTokens.notificationSurface,
        text: colorTokens.notification,
        border: "rgba(244, 130, 58, 0.25)",
      };
    case "mixed":
    default:
      return {
        bg: colorTokens.brandSurface,
        text: colorTokens.brandText,
        border: colorTokens.brandBorder,
      };
  }
}

export function StudentAccommodationDetailScreen({
  accommodation: initialAccommodation,
  id,
  onBack,
  onContactRevealed,
  style,
}: StudentAccommodationDetailScreenProps) {
  const { t, language } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [detail, setDetail] = useState<StudentAccommodationDetail | undefined>(
    initialAccommodation,
  );
  const [loading, setLoading] = useState(!initialAccommodation && Boolean(id));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(
    Boolean(initialAccommodation?.is_saved),
  );
  const [selectedGalleryTab, setSelectedGalleryTab] = useState<GalleryTab>("all");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Guarded contact state
  const [contactRevealed, setContactRevealed] = useState(
    Boolean(initialAccommodation?.contact_revealed),
  );
  const [contactChannels, setContactChannels] = useState(
    initialAccommodation?.contact_channels,
  );
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialAccommodation && id) {
      setLoading(true);
      getAccommodationDetail(id)
        .then((data) => {
          setDetail(data);
          setIsSaved(Boolean(data.is_saved));
          setContactRevealed(Boolean(data.contact_revealed));
          setContactChannels(data.contact_channels);
        })
        .catch(() => {
          setLoadError(t("studentAccommodation.contactRevealFailed"));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, initialAccommodation, t]);

  const handleToggleSave = async () => {
    if (!detail) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await apiToggleSave(detail.id);
    } catch {
      setIsSaved(!nextSaved);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const doReveal = async () => {
    if (!detail) return;
    setIsRevealing(true);
    setRevealError(null);
    try {
      const res = await apiRevealContact(detail.id);
      setContactRevealed(true);
      setContactChannels(res.contact_channels);
      onContactRevealed?.(res.contact_channels);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 429) {
        setRevealError(t("studentAccommodation.rateLimitError"));
      } else {
        setRevealError(t("studentAccommodation.contactRevealFailed"));
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const handleRevealContactClick = () => {
    if (!user) {
      useAuthModalStore.getState().open(() => {
        doReveal();
      });
      return;
    }
    doReveal();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, style]}>
        <ActivityIndicator size="large" color={colorTokens.brand} />
      </View>
    );
  }

  if (loadError || !detail) {
    return (
      <View style={[styles.centerContainer, style]}>
        <AlertCircle size={36} color={colorTokens.errorText} />
        <Text style={styles.errorText}>
          {loadError ?? t("studentAccommodation.contactRevealFailed")}
        </Text>
      </View>
    );
  }

  const genderStyle = getGenderPolicyStyle(detail.gender_policy);

  // Gallery items filtering
  const mediaList = detail.media && detail.media.length > 0
    ? detail.media
    : detail.primary_image_url
      ? [{ id: "primary", url: detail.primary_image_url, label: "room" as MediaLabel }]
      : [];

  const filteredMedia =
    selectedGalleryTab === "all"
      ? mediaList
      : mediaList.filter((m) => m.label === selectedGalleryTab);

  const activePhotoUrl =
    filteredMedia.length > 0
      ? filteredMedia[Math.min(activePhotoIndex, filteredMedia.length - 1)]?.url
      : detail.primary_image_url;

  // University proximity string
  const walkingMinutes = formatLocalizedNumber(
    detail.nearest_campus?.walking_time_minutes ?? 0,
    language,
  );
  const approxTag = detail.nearest_campus?.is_approximate
    ? ` ${t("studentAccommodation.approximate")}`
    : "";
  const campusDisplay = `${walkingMinutes} ${t("studentAccommodation.walk_distance_suffix")} to ${detail.nearest_campus?.university_name ?? ""}${approxTag}`;

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Bar */}
      <View style={styles.navBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <ArrowLeft size={20} color={colorTokens.ink} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isSaved
              ? t("studentAccommodation.unsaveAccommodation")
              : t("studentAccommodation.saveAccommodation")
          }
          onPress={handleToggleSave}
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Heart
            size={20}
            color={isSaved ? colorTokens.saved : colorTokens.ink}
            fill={isSaved ? colorTokens.saved : "transparent"}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      {/* Image Gallery Hero & Tabs */}
      <View style={styles.galleryCard}>
        <View style={styles.heroImageContainer}>
          {activePhotoUrl ? (
            <Image
              source={{ uri: activePhotoUrl }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={detail.title}
            />
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <Building size={48} color={colorTokens.subtle} />
            </View>
          )}

          {/* Gender Policy Badge Overlaid */}
          <View
            style={[
              styles.genderBadge,
              { backgroundColor: genderStyle.bg, borderColor: genderStyle.border },
            ]}
          >
            <Text style={[styles.genderBadgeText, { color: genderStyle.text }]}>
              {t(`studentAccommodation.${detail.gender_policy}`)}
            </Text>
          </View>
        </View>

        {/* Gallery Categorization Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryTabsScroll}
        >
          {GALLERY_TABS.map((tab) => {
            const isSelected = selectedGalleryTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                accessibilityLabel={t(tab.labelKey as any)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setSelectedGalleryTab(tab.key);
                  setActivePhotoIndex(0);
                }}
                style={[
                  styles.galleryTab,
                  isSelected && styles.galleryTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.galleryTabText,
                    isSelected && styles.galleryTabTextActive,
                  ]}
                >
                  {t(tab.labelKey as any)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Section 1: Core Overview */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {t("studentAccommodation.overviewTitle")}
        </Text>

        <View style={styles.badgesRow}>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>
              {t(`studentAccommodation.${detail.subtype}`)}
            </Text>
          </View>

          <View style={styles.seatsPill}>
            <Text style={styles.seatsPillText}>
              {t("studentAccommodation.seat_count", {
                available: formatLocalizedNumber(detail.available_seats, language),
                total: formatLocalizedNumber(detail.total_seats, language),
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.titleText}>{detail.title}</Text>

        {detail.nearest_campus ? (
          <View style={styles.rowItem}>
            <Clock size={16} color={colorTokens.brandText} />
            <Text style={styles.proximityText}>{campusDisplay}</Text>
          </View>
        ) : null}

        {detail.address ? (
          <View style={styles.rowItem}>
            <MapPin size={16} color={colorTokens.muted} />
            <Text style={styles.addressText}>{detail.address}</Text>
          </View>
        ) : null}

        {detail.description ? (
          <Text style={styles.descriptionText}>{detail.description}</Text>
        ) : null}
      </View>

      {/* Section 2: Financial Breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {t("studentAccommodation.financialsTitle")}
        </Text>

        <View style={styles.grid2}>
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>
              {t("studentAccommodation.rent_per_month")}
            </Text>
            <Text style={styles.factValueHighlight}>
              {formatLocalizedPrice(detail.governance?.rent ?? detail.total_rent, "BDT", language)}{" "}
              <Text style={styles.priceSuffix}>
                {t("studentAccommodation.priceSuffix")}
              </Text>
            </Text>
          </View>

          <View style={styles.factBox}>
            <Text style={styles.factLabel}>
              {t("studentAccommodation.securityDeposit")}
            </Text>
            <Text style={styles.factValue}>
              {formatLocalizedPrice(detail.governance?.security_deposit ?? 0, "BDT", language)}
            </Text>
          </View>

          <View style={styles.factBox}>
            <Text style={styles.factLabel}>
              {t("studentAccommodation.advanceRent")}
            </Text>
            <Text style={styles.factValue}>
              {formatLocalizedNumber(detail.governance?.advance_months ?? 0, language)}{" "}
              {t("studentAccommodation.monthsSuffix")}
            </Text>
          </View>

          <View style={styles.factBox}>
            <Text style={styles.factLabel}>
              {t("studentAccommodation.noticePeriod")}
            </Text>
            <Text style={styles.factValue}>
              {formatLocalizedNumber(detail.governance?.notice_period_days ?? 0, language)}{" "}
              {t("studentAccommodation.daysSuffix")}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 3: Rules & Governance */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {t("studentAccommodation.rulesTitle")}
        </Text>

        <View style={styles.chipsWrap}>
          {detail.rules?.smoking_policy ? (
            <View style={styles.ruleChip}>
              <Text style={styles.ruleChipText}>
                {t(`studentAccommodation.smoking_${detail.rules.smoking_policy}`)}
              </Text>
            </View>
          ) : null}

          {detail.rules?.guest_policy ? (
            <View style={styles.ruleChip}>
              <Text style={styles.ruleChipText}>
                {t(`studentAccommodation.guest_${detail.rules.guest_policy}`)}
              </Text>
            </View>
          ) : null}

          {detail.rules?.meal_system ? (
            <View style={styles.ruleChip}>
              <Text style={styles.ruleChipText}>
                {t(`studentAccommodation.meal_${detail.rules.meal_system}`)}
              </Text>
            </View>
          ) : null}

          {detail.rules?.quiet_hours_start && detail.rules?.quiet_hours_end ? (
            <View style={styles.ruleChip}>
              <Text style={styles.ruleChipText}>
                {t("studentAccommodation.quietHours", {
                  start: detail.rules.quiet_hours_start,
                  end: detail.rules.quiet_hours_end,
                })}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Section 4: Safety & Building Amenities */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {t("studentAccommodation.safetyTitle")}
        </Text>

        <View style={styles.amenitiesGrid}>
          {detail.safety?.floor_level !== undefined ? (
            <View style={styles.amenityItem}>
              <Building size={16} color={colorTokens.brandText} />
              <Text style={styles.amenityText}>
                {t("studentAccommodation.floorLevel", {
                  level: formatLocalizedNumber(detail.safety.floor_level, language),
                })}
              </Text>
            </View>
          ) : null}

          <View style={styles.amenityItem}>
            {detail.safety?.has_lift ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />
            )}
            <Text
              style={[
                styles.amenityText,
                !detail.safety?.has_lift && styles.amenityTextDisabled,
              ]}
            >
              {t("studentAccommodation.lift")}
            </Text>
          </View>

          <View style={styles.amenityItem}>
            {detail.safety?.has_security_guard ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />
            )}
            <Text
              style={[
                styles.amenityText,
                !detail.safety?.has_security_guard && styles.amenityTextDisabled,
              ]}
            >
              {t("studentAccommodation.security_guard")}
            </Text>
          </View>

          <View style={styles.amenityItem}>
            {detail.safety?.has_cctv ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />
            )}
            <Text
              style={[
                styles.amenityText,
                !detail.safety?.has_cctv && styles.amenityTextDisabled,
              ]}
            >
              {t("studentAccommodation.cctv")}
            </Text>
          </View>

          <View style={styles.amenityItem}>
            {detail.safety?.has_generator ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />
            )}
            <Text
              style={[
                styles.amenityText,
                !detail.safety?.has_generator && styles.amenityTextDisabled,
              ]}
            >
              {t("studentAccommodation.generator")}
            </Text>
          </View>

          <View style={styles.amenityItem}>
            {detail.safety?.has_wifi ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />
            )}
            <Text
              style={[
                styles.amenityText,
                !detail.safety?.has_wifi && styles.amenityTextDisabled,
              ]}
            >
              {t("studentAccommodation.wifi")}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 5: Guarded Contact Section */}
      <View style={styles.card}>
        <View style={styles.contactHeaderRow}>
          <ShieldCheck size={20} color={colorTokens.brandText} />
          <Text style={styles.sectionHeading}>
            {t("studentAccommodation.contactTitle")}
          </Text>
        </View>

        {!contactRevealed ? (
          <View style={styles.guardedContactBox}>
            <Text style={styles.contactNoticeText}>
              {t("studentAccommodation.contactLockedNotice")}
            </Text>

            {revealError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={colorTokens.errorText} />
                <Text style={styles.errorBannerText}>{revealError}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("studentAccommodation.showContactCTA")}
              onPress={handleRevealContactClick}
              disabled={isRevealing}
              style={({ pressed }) => [
                styles.revealCTAButton,
                pressed && styles.buttonPressed,
              ]}
            >
              {isRevealing ? (
                <ActivityIndicator size="small" color={colorTokens.surface} />
              ) : (
                <Text style={styles.revealCTAButtonText}>
                  {t("studentAccommodation.showContactCTA")}
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.revealedContactBox}>
            {contactChannels?.masked_phone ? (
              <View style={styles.phoneDisplayRow}>
                <Phone size={18} color={colorTokens.brandText} />
                <Text style={styles.phoneDisplayText}>
                  {contactChannels.masked_phone}
                </Text>
              </View>
            ) : null}

            <View style={styles.contactActionsRow}>
              {contactChannels?.allows_call && contactChannels.masked_phone ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("studentAccommodation.callHost")}
                  onPress={() =>
                    Linking.openURL(`tel:${contactChannels.masked_phone}`)
                  }
                  style={({ pressed }) => [
                    styles.actionButtonCall,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Phone size={16} color={colorTokens.surface} />
                  <Text style={styles.actionButtonCallText}>
                    {t("studentAccommodation.callHost")}
                  </Text>
                </Pressable>
              ) : null}

              {contactChannels?.allows_whatsapp && contactChannels.masked_phone ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("studentAccommodation.whatsappHost")}
                  onPress={() => {
                    const cleanNumber = contactChannels.masked_phone!.replace(
                      /\D/g,
                      "",
                    );
                    Linking.openURL(`https://wa.me/${cleanNumber}`);
                  }}
                  style={({ pressed }) => [
                    styles.actionButtonWhatsApp,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MessageSquare size={16} color={colorTokens.brandText} />
                  <Text style={styles.actionButtonWhatsAppText}>
                    {t("studentAccommodation.whatsappHost")}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorTokens.canvas,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 240,
    gap: 12,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
      } as ViewStyle,
      default: {
        elevation: 1,
      },
    }),
  },
  galleryCard: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
  },
  heroImageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colorTokens.surfaceSunken,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.surfaceSunken,
  },
  genderBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  genderBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  galleryTabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  galleryTab: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  galleryTabActive: {
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  galleryTabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  galleryTabTextActive: {
    fontFamily: fonts.semiBold,
    color: colorTokens.brandText,
  },
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    padding: 16,
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.03)",
      } as ViewStyle,
      default: {
        elevation: 1,
      },
    }),
  },
  sectionHeading: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 17,
    color: colorTokens.ink,
    lineHeight: 22,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  pillBadge: {
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  pillBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.body,
  },
  seatsPill: {
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  seatsPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.brandText,
  },
  titleText: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colorTokens.ink,
    lineHeight: 26,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proximityText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.brandText,
  },
  addressText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colorTokens.body,
    lineHeight: 20,
    marginTop: 4,
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  factBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: colorTokens.surfaceSunken,
    padding: 12,
    borderRadius: radius.md,
    gap: 4,
  },
  factLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
  },
  factValueHighlight: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: colorTokens.brandText,
  },
  priceSuffix: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.muted,
  },
  factValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ruleChip: {
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  ruleChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.body,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 140,
    minHeight: 44,
  },
  amenityText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colorTokens.ink,
  },
  amenityTextDisabled: {
    color: colorTokens.subtle,
    textDecorationLine: "line-through",
  },
  contactHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guardedContactBox: {
    gap: 12,
  },
  contactNoticeText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.muted,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorTokens.errorSurface,
    padding: 10,
    borderRadius: radius.md,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.errorText,
    lineHeight: 18,
  },
  revealCTAButton: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  revealCTAButtonText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
    color: colorTokens.surface,
  },
  revealedContactBox: {
    gap: 12,
  },
  phoneDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colorTokens.surfaceSunken,
    padding: 12,
    borderRadius: radius.md,
  },
  phoneDisplayText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colorTokens.ink,
  },
  contactActionsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButtonCall: {
    flex: 1,
    minWidth: 130,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandText,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  actionButtonCallText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.surface,
  },
  actionButtonWhatsApp: {
    flex: 1,
    minWidth: 130,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: colorTokens.brandBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  actionButtonWhatsAppText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colorTokens.brandText,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colorTokens.errorText,
    textAlign: "center",
  },
});

export default StudentAccommodationDetailScreen;

