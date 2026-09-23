import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Bath, BedDouble, Heart, LandPlot, MapPin, ShieldCheck } from "lucide-react-native";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { cdnImage } from "@/lib/cloudinaryImage";
import type { Property } from "@/features/property/types/property";

export type PropertyCardVariant = "standard" | "feature";

interface PropertyCardProps {
  property: Property;
  /**
   * `standard` — photo above a fact block. The default everywhere.
   * `feature`  — photo fills the card, facts overlay it. Curated rails only;
   *              see the scrim note below before reusing it.
   */
  variant?: PropertyCardVariant;
  saved?: boolean;
  onSave?: () => void;
  onPress?: () => void;
  imageHeight?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bangladeshi money reads in crore and lakh, not in grouped digits.
 * 48,500,000 is unparseable at a glance; 4.85 Cr is not.
 */
function formatPrice(price: number, currency: string): string {
  const unit = currency === "BDT" ? "৳" : currency;
  if (price >= 10_000_000) return `${unit} ${(price / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (price >= 100_000) return `${unit} ${(price / 100_000).toFixed(2).replace(/\.00$/, "")} Lac`;
  return `${unit} ${price.toLocaleString("en-BD")}`;
}

function readSpecs(property: Property) {
  const amenities = (property.amenities ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  return {
    // `land` and `parking` carry neither, so both legitimately come back null.
    beds: num(property.bedrooms ?? amenities.bedrooms),
    baths: num(property.bathrooms ?? amenities.bathrooms),
    area: property.area_size
      ? `${property.area_size.toLocaleString("en-BD")} ${property.area_unit || "sqft"}`
      : null,
  };
}

export function PropertyCard({
  property,
  variant = "standard",
  saved = false,
  onSave,
  onPress,
  imageHeight,
  width,
  style,
}: PropertyCardProps) {
  const { isPhone } = useResponsive();

  const original =
    property.media?.find((m) => m.media_type === "image")?.url ??
    property.media?.[0]?.url ??
    null;

  const location =
    [property.area?.name, property.area?.city].filter(Boolean).join(", ") ||
    property.address ||
    "Location unavailable";

  const isRent = property.listing_type === "rent";
  const price = formatPrice(property.price, property.price_currency || "BDT");
  const specs = readSpecs(property);
  const isFeature = variant === "feature";

  const open = () => {
    if (onPress) onPress();
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
        <Text style={styles.verifiedText}>Verified</Text>
      </View>
    </View>
  ) : null;

  /**
   * Rendered as a SIBLING of the card's pressable, never a child.
   * react-native-web renders Pressable as <button>, and a nested button is
   * invalid HTML — it breaks hydration and swallows the inner click.
   */
  const saveButton = onSave ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
      onPress={onSave}
      style={[styles.saveButton, webPointer]}
    >
      <Heart
        color={saved ? colorTokens.notification : colorTokens.ink}
        fill={saved ? colorTokens.notification : "transparent"}
        size={17}
      />
    </Pressable>
  ) : null;

  const placeholder = (
    <View style={styles.placeholder}>
      <LandPlot color={colorTokens.subtle} size={30} />
      <Text style={styles.placeholderText}>No photo provided</Text>
    </View>
  );

  // ── Feature: photo fills the card, facts overlay it ──────────────────────
  if (isFeature) {
    return (
      <View style={[styles.shell, width ? { width } : null, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${property.title}, ${isRent ? "for rent" : "for sale"}, ${price}`}
        onPress={open}
        style={({ hovered, pressed }: any) => [
          styles.card,
          styles.cardFeature,
          hovered && styles.cardHovered,
          pressed && styles.cardPressed,
          webPointer,
        ]}
      >
        <View style={{ height: mediaHeight }}>
          {photo ? (
            <ImageBackground source={{ uri: photo }} style={styles.fill} resizeMode="cover">
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
                  {isRent ? <Text style={styles.featurePriceSuffix}>/mo</Text> : null}
                </Text>
              </View>
            </ImageBackground>
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
      accessibilityLabel={`${property.title}, ${isRent ? "for rent" : "for sale"}, ${price}`}
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
          <Image source={{ uri: photo }} style={styles.fill} resizeMode="cover" />
        ) : (
          placeholder
        )}
        {verifiedBadge}
        <View style={styles.intentTag}>
          <Text style={styles.intentText}>{isRent ? "For rent" : "For sale"}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.price}>
          {price}
          {isRent ? <Text style={styles.priceSuffix}>/mo</Text> : null}
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
    backgroundColor: colorTokens.surface,
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
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  body: { padding: 16, gap: 5 },
  price: {
    color: colorTokens.ink,
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
    color: colorTokens.ink,
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
});
