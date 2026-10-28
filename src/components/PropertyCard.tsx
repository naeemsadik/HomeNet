import React, { memo } from "react";
import {
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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bath,
  BedDouble,
  Camera,
  Heart,
  LandPlot,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { cdnImage } from "@/lib/cloudinaryImage";
import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";
import { useTranslation, formatLocalizedPrice, isPriceOnRequest, formatLocalizedNumber, translateAreaUnit, type SupportedLanguage } from "@/i18n";
import type { Property } from "@/features/property/types/property";
import { isHolidayStayType } from "@/features/property/utils/listingType";
import { useSavedStore } from "@/stores/savedStore";

export type PropertyCardVariant = "standard" | "feature";

/**
 * Fixed standard numeric height including card content and spacing for layout optimization.
 */
export const CARD_HEIGHT = 380;

export interface PropertyCardProps {
  property: Property;
  /**
   * `standard`: photo above a fact block. The default everywhere.
   * `feature` : photo fills the card, facts overlay it. Curated rails only;
   *              see the scrim note below before reusing it.
   */
  variant?: PropertyCardVariant;
  saved?: boolean;
  /** Receives the card's property, so a list can pass one stable handler to every card. */
  onSave?: (property: Property) => void;
  onPress?: (property: Property) => void;
  imageHeight?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

function readSpecs(property: Property, lang: SupportedLanguage) {
  const amenities = (property.amenities ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const bedsVal = num(property.bedrooms ?? amenities.bedrooms);
  const bathsVal = num(property.bathrooms ?? amenities.bathrooms);
  return {
    // `land` and `parking` carry neither, so both legitimately come back null.
    beds: bedsVal !== null ? formatLocalizedNumber(bedsVal, lang) : null,
    baths: bathsVal !== null ? formatLocalizedNumber(bathsVal, lang) : null,
    area: property.area_size
      ? `${formatLocalizedNumber(property.area_size.toLocaleString("en-BD"), lang)} ${translateAreaUnit(property.area_unit, lang)}`
      : null,
  };
}

function PropertyCardComponent({
  property,
  variant = "standard",
  saved = false,
  onSave,
  onPress,
  imageHeight,
  width,
  style,
}: PropertyCardProps) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();

  const original =
    property.media?.find((m) => m.media_type === "image")?.url ??
    property.media?.[0]?.url ??
    null;

  const location =
    [property.area?.name, property.area?.city].filter(Boolean).join(", ") ||
    property.address ||
    t("propertyCard.locationUnavailable");

  const isRent = property.listing_type === "rent";
  const isHoliday = isHolidayStayType(property.listing_type);
  const intentLabel = isHoliday ? t("propertyCard.holidayStay") : t(isRent ? "propertyCard.forRent" : "propertyCard.forSale");
  const price = formatLocalizedPrice(property.price, property.price_currency || "BDT", language);
  const specs = readSpecs(property, language);
  const isFeature = variant === "feature";

  const open = () => {
    if (onPress) onPress(property);
    else if (property.id) router.push(`/property/${property.id}` as never);
  };

  const mediaHeight = imageHeight ?? (isFeature ? (isPhone ? 300 : 360) : isPhone ? 190 : 210);

  // Widest a card gets is ~600 (half of the 1240 container); a feature card
  // spans it. Fetch at 2x that for retina, and pass the height so the crop
  // matches the box instead of arriving at the wrong aspect ratio.
  const photo = cdnImage(original, isFeature ? 1240 : 1200, mediaHeight * 2);

  const verifiedBadge = property.is_verified ? (
    <View style={styles.badgeRow} pointerEvents="none">
      <View style={styles.verifiedBadge}>
        <ShieldCheck color={colorTokens.info} size={13} strokeWidth={2.4} />
        <Text style={styles.verifiedText}>{t("propertyCard.verified")}</Text>
      </View>
    </View>
  ) : null;

  const isSavedInStore = useSavedStore((state) => state.isSaved(property?.id));
  const isCardSaved = saved !== undefined ? saved : isSavedInStore;

  const handleSave = (e?: any) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    if (onSave) {
      onSave(property);
    } else if (property) {
      void useSavedStore.getState().toggleSaved(property);
    }
  };

  /**
   * Rendered as a SIBLING of the card's pressable, never a child.
   * react-native-web renders Pressable as <button>, and a nested button is
   * invalid HTML: it breaks hydration and swallows the inner click.
   */
  const saveButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isCardSaved
          ? t("propertyCard.removeFromSaved", { title: property.title })
          : t("propertyCard.saveProperty", { title: property.title })
      }
      onPress={handleSave}
      style={({ hovered, pressed }: any) => [
        styles.saveButton,
        hovered && { backgroundColor: "#FFFFFF", transform: [{ scale: 1.06 }] },
        pressed && { transform: [{ scale: 0.94 }] },
        webPointer,
      ]}
    >
      <Heart
        color={isCardSaved ? "#D4183D" : colorTokens.ink}
        fill={isCardSaved ? "#D4183D" : "transparent"}
        size={17}
      />
    </Pressable>
  );

  const placeholder = (
    <View style={styles.placeholder}>
      <LandPlot color={colorTokens.subtle} size={30} />
      <Text style={styles.placeholderText}>{t("propertyCard.noPhoto")}</Text>
    </View>
  );

  // ── Mobile Rightmove Alignment (< 768px / isPhone) ──────────────────────
  const images = React.useMemo(() => {
    const list = property.media?.filter((m) => m.media_type === "image" && m.url).map((m) => m.url) ?? [];
    if (list.length > 0) return list;
    if (original) return [original];
    return [];
  }, [property.media, original]);

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [cardWidth, setCardWidth] = React.useState(0);

  const hasFloorPlan = Boolean(property.amenities?.floor_plan || property.amenities?.floorPlan);

  const recencyText = React.useMemo(() => {
    const dateStr = property.updated_at || property.published_at || property.created_at;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return t("propertyCard.addedToday");
    }
    const formatted = date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return property.updated_at && property.updated_at !== property.created_at
      ? t("propertyCard.updatedDate", { date: formatted })
      : t("propertyCard.addedDate", { date: formatted });
  }, [property.updated_at, property.published_at, property.created_at, t, language]);

  const sellerPhone =
    property.user?.auth_identities?.find((id) => id.phone)?.phone ||
    (property as any).seller?.phone ||
    null;

  const handleCall = (e?: any) => {
    e?.stopPropagation?.();
    if (!sellerPhone) {
      open();
      return;
    }
    const clean = sellerPhone.replace(/[^\d+]/g, "");
    const telUrl = `tel:${clean}`;
    if (isSafeLinkUrl(telUrl)) {
      openExternalUrl(telUrl);
    }
  };

  const handleWhatsApp = (e?: any) => {
    e?.stopPropagation?.();
    if (!sellerPhone) {
      open();
      return;
    }
    const clean = sellerPhone.replace(/[^\d]/g, "");
    const defaultSeller = language === "bn" ? "মালিক" : "Seller";
    const defaultProp = language === "bn" ? "প্রোপার্টি" : "Property";
    const greeting = language === "bn"
      ? `আসসালামু আলাইকুম ${property.user?.full_name || defaultSeller}, আমি HomeNet-এ আপনার প্রোপার্টি "${property.title || defaultProp}" সম্পর্কে আগ্রহী। এটি কি এখনো পাওয়া যাচ্ছে?`
      : `Hello ${property.user?.full_name || defaultSeller}, I am interested in your property "${property.title || defaultProp}" on HomeNet. Is it currently available?`;
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(greeting)}`;
    if (isSafeLinkUrl(waUrl)) {
      openExternalUrl(waUrl);
    }
  };

  const handleInquire = (e?: any) => {
    e?.stopPropagation?.();
    open();
  };

  if (isPhone) {
    const bedCount = property.bedrooms || specs.beds;
    const typeName =
      property.subtype ||
      (property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : "Property");
    const specTitle = bedCount ? `${bedCount} bed ${typeName}` : typeName;

    return (
      <View
        style={[styles.mobileCardShell, width ? { width } : null, style]}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.mobileCard}>
          {/* Main Card Tappable Area */}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${property.title}, ${intentLabel}, ${price}`}
            onPress={open}
            style={({ pressed }) => [
              styles.mobileCardBodyPressable,
              webPointer,
              pressed && { opacity: 0.96 },
            ]}
          >
            {/* 1. Media Container & Carousel */}
            <View style={styles.mobileMediaContainer}>
              {images.length > 1 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  onScroll={(e: any) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const w = e.nativeEvent.layoutMeasurement.width;
                    if (w > 0) {
                      const idx = Math.round(x / w);
                      if (idx !== activeImageIndex && idx >= 0 && idx < images.length) {
                        setActiveImageIndex(idx);
                      }
                    }
                  }}
                  scrollEventThrottle={16}
                  style={StyleSheet.absoluteFill}
                >
                  {images.map((imgUri, idx) => (
                    <View
                      key={`${imgUri}-${idx}`}
                      style={[styles.mobileSlide, cardWidth > 0 ? { width: cardWidth } : null]}
                    >
                      <Image
                        source={{ uri: cdnImage(imgUri, 800, 480) }}
                        accessibilityLabel={`${property.title} photo ${idx + 1}`}
                        style={styles.fill}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : images.length === 1 ? (
                <Image
                  source={{ uri: cdnImage(images[0], 800, 480) }}
                  accessibilityLabel={property.title}
                  style={styles.fill}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                placeholder
              )}

              {/* Top-left image counter badge */}
              <View style={styles.imageCounterBadge} pointerEvents="none">
                <Camera size={13} color={colorTokens.onInk} strokeWidth={2.2} />
                <Text style={styles.imageCounterText}>
                  {images.length > 0 ? `${activeImageIndex + 1}/${images.length}` : "1/1"}
                </Text>
                {hasFloorPlan ? (
                  <>
                    <View style={styles.counterDivider} />
                    <Text style={styles.floorPlanText}>{t("propertyCard.floorPlan")}</Text>
                  </>
                ) : null}
              </View>

              {/* Bottom dots */}
              {images.length > 1 ? (
                <View style={styles.dotsContainer} pointerEvents="none">
                  {images.slice(0, 5).map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        activeImageIndex === idx && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            {/* 2. Status Badge Ribbon */}
            {property.is_verified ? (
              <View style={styles.ribbonVerified}>
                <ShieldCheck size={14} color={colorTokens.brandText} strokeWidth={2.4} />
                <Text style={styles.ribbonVerifiedText}>{t("propertyCard.verifiedFull")}</Text>
              </View>
            ) : (
              <View style={styles.ribbonOwner}>
                <Text style={styles.ribbonOwnerText}>{t("propertyCard.directOwner")}</Text>
              </View>
            )}

            {/* 3. Card Typography & Information Hierarchy */}
            <View style={styles.mobileBody}>
              <Text style={styles.mobilePrice}>
                {price}
                {isRent ? <Text style={styles.mobilePriceSuffix}>{t("propertyCard.perMonth")}</Text> : null}
              </Text>

              <Text numberOfLines={1} style={styles.mobileSpecTitle}>
                {specTitle}
              </Text>

              <View style={styles.mobileLocationRow}>
                <MapPin color={colorTokens.muted} size={14} strokeWidth={2} />
                <Text numberOfLines={1} style={styles.mobileLocationText}>
                  {location}
                </Text>
              </View>

              {recencyText ? (
                <Text style={styles.mobileRecencyText}>{recencyText}</Text>
              ) : null}
            </View>
          </Pressable>

          {/* Top-right heart button: positioned absolute over media */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isCardSaved
                ? t("propertyCard.removeFromSaved", { title: property.title })
                : t("propertyCard.saveProperty", { title: property.title })
            }
            onPress={handleSave}
            style={[styles.mobileSaveBtn, webPointer]}
          >
            <Heart
              color={isCardSaved ? colorTokens.saved : colorTokens.ink}
              fill={isCardSaved ? colorTokens.saved : "transparent"}
              size={18}
            />
          </Pressable>

          {/* 4. In-Card Bottom Action Row (3-column action footer) */}
          <View style={styles.actionFooter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("propertyDetail.inquire")}
              onPress={handleInquire}
              style={({ pressed }) => [
                styles.actionBtn,
                webPointer,
                pressed && { backgroundColor: colorTokens.surfaceSunken },
              ]}
            >
              <Mail size={16} color={colorTokens.brandText} strokeWidth={2} />
              <Text style={styles.actionBtnText}>{t("propertyDetail.inquire")}</Text>
            </Pressable>

            <View style={styles.actionDivider} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("propertyDetail.call")}
              onPress={handleCall}
              style={({ pressed }) => [
                styles.actionBtn,
                webPointer,
                pressed && { backgroundColor: colorTokens.surfaceSunken },
              ]}
            >
              <Phone size={16} color={colorTokens.brandText} strokeWidth={2} />
              <Text style={styles.actionBtnText}>{t("propertyDetail.call")}</Text>
            </Pressable>

            <View style={styles.actionDivider} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("propertyDetail.whatsapp")}
              onPress={handleWhatsApp}
              style={({ pressed }) => [
                styles.actionBtn,
                webPointer,
                pressed && { backgroundColor: colorTokens.surfaceSunken },
              ]}
            >
              <MessageSquare size={16} color={colorTokens.brandText} strokeWidth={2} />
              <Text style={styles.actionBtnText}>{t("propertyDetail.whatsapp")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── Feature: photo fills the card, facts overlay it ──────────────────────
  if (isFeature) {
    return (
      <View style={[styles.shell, width ? { width } : null, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${property.title}, ${intentLabel}, ${price}`}
          onPress={open}
          style={({ hovered, pressed }: any) => [
            styles.card,
            styles.cardFeature,
            hovered && styles.cardHovered,
            pressed && styles.cardPressed,
            webPointer,
          ]}
        >
          <View style={{ height: mediaHeight, width: "100%", overflow: "hidden" }}>
            {photo ? (
              <>
                <Image
                  source={{ uri: photo }}
                  accessibilityLabel={property.title}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
                {/*
                  0.86 at the base is not a taste choice. White text over a pure-white
                  photo blended with ink at 0.86 still measures ~5:1, so the overlay
                  stays legible on the brightest listing anyone can upload.
                */}
                <LinearGradient
                  colors={["rgba(11,26,23,0)", "rgba(11,26,23,0.45)", "rgba(11,26,23,0.86)"]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />
                {verifiedBadge}
                <View style={styles.featureBody}>
                  <Text numberOfLines={1} style={styles.featureLocation}>{location}</Text>
                  <Text numberOfLines={2} style={styles.featureTitle}>{property.title}</Text>
                  <Text style={styles.featurePrice}>
                    {price}
                    {isRent ? <Text style={styles.featurePriceSuffix}>{t("propertyCard.perMonth")}</Text> : null}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.fill}>
                {placeholder}
                {verifiedBadge}
              </View>
            )}
          </View>
        </Pressable>
        {saveButton}
      </View>
    );
  }

  // ── Standard: photo above a fact block ───────────────────────────────────
  return (
    <View style={[styles.shell, width ? { width } : null, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${property.title}, ${intentLabel}, ${price}`}
        onPress={open}
        style={({ hovered, pressed }: any) => [
          styles.card,
          hovered && styles.cardHovered,
          pressed && styles.cardPressed,
          webPointer,
        ]}
      >
        <View style={[styles.media, { height: mediaHeight }]}>
          {photo ? (
            <Image
              source={{ uri: photo }}
              accessibilityLabel={property.title}
              style={styles.fill}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            placeholder
          )}
          {verifiedBadge}
          <View style={styles.intentTag}>
            <Text style={styles.intentText}>{intentLabel}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.price}>
            {price}
            {isRent && !isPriceOnRequest(property.price) ? <Text style={styles.priceSuffix}>{t("propertyCard.perMonth")}</Text> : null}
          </Text>

          <Text numberOfLines={2} style={styles.title}>{property.title}</Text>

          <View style={styles.locationRow}>
            <MapPin color={colorTokens.muted} size={14} strokeWidth={2} />
            <Text numberOfLines={1} style={styles.location}>{location}</Text>
          </View>

          {specs.beds || specs.baths || specs.area ? (
            <View style={styles.specs}>
              {specs.beds ? (
                <View style={styles.spec}>
                  <BedDouble color={colorTokens.muted} size={15} strokeWidth={2} />
                  <Text style={styles.specText}>{specs.beds}</Text>
                </View>
              ) : null}
              {specs.baths ? (
                <View style={styles.spec}>
                  <Bath color={colorTokens.muted} size={15} strokeWidth={2} />
                  <Text style={styles.specText}>{specs.baths}</Text>
                </View>
              ) : null}
              {specs.area ? (
                <View style={styles.spec}>
                  <LandPlot color={colorTokens.muted} size={15} strokeWidth={2} />
                  <Text style={styles.specText}>{specs.area}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
      {saveButton}
    </View>
  );
}

export const PropertyCard = memo(PropertyCardComponent);

const styles = StyleSheet.create({
  // Positioning context so the save button can overlay without nesting inside
  // the card's <button>.
  shell: {
    width: "100%",
    position: "relative",
  },
  // Elevation declared once: a hairline. No shadow underneath it.
  card: {
    width: "100%",
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...(Platform.select({
      web: { transition: "border-color 0.15s ease" },
      default: {},
    }) as any),
  },
  cardFeature: { borderColor: "transparent" },
  cardHovered: { borderColor: "rgba(11, 26, 23, 0.20)" },
  cardPressed: { opacity: 0.94 },

  fill: { width: "100%", height: "100%" },

  media: {
    position: "relative",
    width: "100%",
    backgroundColor: colorTokens.surfaceSunken,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colorTokens.surfaceSunken,
  },
  placeholderText: {
    color: colorTokens.subtle,
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    // Stops short of the save button's 34px + 12px gutter.
    right: 58,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.infoSurface,
  },
  verifiedText: {
    color: colorTokens.info,
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  saveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },

  intentTag: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  intentText: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  body: { padding: 16, gap: 5 },
  price: {
    color: "#0F6D55",
    fontFamily: fonts.headingExtraBold,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  priceSuffix: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    letterSpacing: 0,
  },
  title: {
    color: "#0B1A17",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 21,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  location: {
    flex: 1,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },
  specs: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    rowGap: 6,
    marginTop: 11,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  spec: { flexDirection: "row", alignItems: "center", gap: 5 },
  specText: {
    color: colorTokens.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
  },

  featureBody: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    gap: 3,
  },
  featureLocation: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.headingBold,
    fontSize: 17,
    lineHeight: 23,
  },
  featurePrice: {
    marginTop: 3,
    color: "#FFFFFF",
    fontFamily: fonts.headingExtraBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  featurePriceSuffix: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  // ── Mobile Rightmove Pattern Styles ──────────────────────────────────────
  mobileCardShell: {
    width: "100%",
    marginBottom: 16,
  },
  mobileCard: {
    width: "100%",
    position: "relative",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  mobileCardBodyPressable: {
    width: "100%",
  },
  mobileMediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 10,
    backgroundColor: colorTokens.surfaceSunken,
    overflow: "hidden",
  },
  mobileSlide: {
    height: "100%",
  },
  imageCounterBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 26, 23, 0.72)",
  },
  imageCounterText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  counterDivider: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 3,
  },
  floorPlanText: {
    color: colorTokens.onInk,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  mobileSaveBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    width: 16,
    backgroundColor: colorTokens.surface,
  },
  ribbonVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colorTokens.brandSurface,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.brandBorder,
  },
  ribbonVerifiedText: {
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  ribbonOwner: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colorTokens.surfaceSunken,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  ribbonOwnerText: {
    color: colorTokens.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  mobileBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },
  mobilePrice: {
    color: colorTokens.brandText,
    fontFamily: fonts.headingExtraBold,
    fontSize: 21,
    letterSpacing: -0.4,
  },
  mobilePriceSuffix: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    letterSpacing: 0,
  },
  mobileSpecTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.headingBold,
    fontSize: 16,
    lineHeight: 22,
  },
  mobileLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  mobileLocationText: {
    flex: 1,
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  mobileRecencyText: {
    color: colorTokens.subtle,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 2,
  },
  actionFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
    backgroundColor: colorTokens.surface,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  actionBtnText: {
    color: colorTokens.brandText,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  actionDivider: {
    width: 1,
    height: 22,
    backgroundColor: colorTokens.divider,
  },
});
