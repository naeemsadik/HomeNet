import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Bath,
  BedDouble,
  Camera,
  Heart,
  LandPlot,
  Mail,
  Maximize2,
  Phone,
  ShieldCheck,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { cdnImage } from "@/lib/cloudinaryImage";
import { isSafeLinkUrl, openExternalUrl } from "@/lib/safeUrl";
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  translateAreaUnit,
  useTranslation,
} from "@/i18n";
import type { Property } from "@/features/property/types/property";

export interface ResultListingCardProps {
  property: Property;
  saved: boolean;
  onSave: (property: Property) => void;
  /** Narrower photo column, for tablet widths. */
  compact?: boolean;
  /** Highlighted while its pin is selected on the map. */
  highlighted?: boolean;
}

const MEDIA_HEIGHT = 268;

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * One search result on a wide screen: a photo collage on the left with the
 * price under it, and on the right the address, the key facts, a short
 * description and the owner's contact row. On phones the results use
 * PropertyCard instead, which stacks the same facts under the photo.
 */
function ResultListingCardComponent({
  property,
  saved,
  onSave,
  compact,
  highlighted,
}: ResultListingCardProps) {
  const { t, language } = useTranslation();

  const images = useMemo(
    () =>
      (property.media ?? [])
        .filter((m) => m.media_type === "image" && m.url)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((m) => m.url),
    [property.media],
  );
  const photoCount = property._count?.media ?? images.length;

  const isRent = property.listing_type === "rent";
  const price = formatLocalizedPrice(property.price, property.price_currency || "BDT", language);

  const amenities = (property.amenities ?? {}) as Record<string, unknown>;
  const positive = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const beds = positive(property.bedrooms ?? amenities.bedrooms);
  const baths = positive(property.bathrooms ?? amenities.bathrooms);
  const size = property.area_size
    ? `${formatLocalizedNumber(property.area_size.toLocaleString("en-BD"), language)} ${translateAreaUnit(property.area_unit, language)}`
    : null;
  const typeName = property.subtype
    ? titleCase(property.subtype)
    : property.type
    ? titleCase(property.type)
    : null;

  const address =
    [property.address, property.area?.name, property.area?.city]
      .filter(Boolean)
      .filter((part, i, all) => all.indexOf(part) === i)
      .join(", ") || t("propertyCard.locationUnavailable");

  const recency = useMemo(() => {
    const raw = property.published_at || property.created_at;
    if (!raw) return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
    if (days <= 0) return t("propertyCard.addedToday");
    return t("propertyCard.addedDate", {
      date: date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });
  }, [property.published_at, property.created_at, t, language]);

  const ownerName = property.user?.full_name || t("search.results.owner");
  const ownerPhone = property.user?.auth_identities?.find((id) => id.phone)?.phone ?? null;
  const initials = (property.user?.full_name ?? "")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const open = () => {
    if (property.id) router.push(`/property/${property.id}` as never);
  };

  const call = () => {
    if (!ownerPhone) return open();
    const url = `tel:${ownerPhone.replace(/[^\d+]/g, "")}`;
    if (isSafeLinkUrl(url)) openExternalUrl(url);
  };

  const photo = (uri: string, w: number, h: number, style: object, label: string) => (
    <Image
      source={{ uri: cdnImage(uri, w, h) }}
      accessibilityLabel={label}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );

  // Three or more photos make a collage: one large, two stacked beside it.
  const collage = images.length >= 3 && !compact;
  const media = (
    <View style={styles.mediaFrame}>
      {images.length === 0 ? (
        <View style={styles.placeholder}>
          <LandPlot color={colorTokens.subtle} size={30} />
          <Text style={styles.placeholderText}>{t("propertyCard.noPhoto")}</Text>
        </View>
      ) : collage ? (
        <View style={styles.collage}>
          {photo(images[0], 900, MEDIA_HEIGHT * 2, styles.collageMain, property.title)}
          <View style={styles.collageSide}>
            {photo(images[1], 420, MEDIA_HEIGHT, styles.collageThumb, `${property.title} 2`)}
            {photo(images[2], 420, MEDIA_HEIGHT, styles.collageThumb, `${property.title} 3`)}
          </View>
        </View>
      ) : (
        photo(images[0], 900, MEDIA_HEIGHT * 2, styles.fill, property.title)
      )}

      {images.length > 0 ? (
        <View style={styles.photoBadge} pointerEvents="none">
          <Camera color={colorTokens.onInk} size={13} strokeWidth={2.2} />
          <Text style={styles.photoBadgeText}>
            {formatLocalizedNumber(Math.max(photoCount, images.length), language)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      {/* Verified listings get a strip across the top, the way a promoted one would. */}
      {property.is_verified ? (
        <View style={styles.ribbon}>
          <ShieldCheck color={colorTokens.onBrand} size={14} strokeWidth={2.4} />
          <Text style={styles.ribbonText}>{t("search.results.verifiedListing").toUpperCase()}</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        {/* Photo column, with the price under the photos */}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("search.results.openListing", { title: property.title })}
          onPress={open}
          style={[styles.mediaCol, compact && styles.mediaColCompact, webPointer]}
        >
          {media}
          <View style={styles.priceBand}>
            <Text style={styles.priceText}>
              {price}
              {isRent ? <Text style={styles.priceSuffix}> {t("propertyCard.perMonth")}</Text> : null}
            </Text>
          </View>
        </Pressable>

        {/* Details column */}
        <View style={styles.detailCol}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("search.results.openListing", { title: property.title })}
            onPress={open}
            style={({ hovered }: any) => [styles.detailBody, webPointer, hovered && styles.detailHover]}
          >
            <Text numberOfLines={2} style={styles.address}>
              {address}
            </Text>

            <View style={styles.factsRow}>
              {typeName ? <Text style={styles.typeText}>{typeName}</Text> : null}
              {beds !== null ? (
                <View style={styles.fact}>
                  <BedDouble color={colorTokens.body} size={17} strokeWidth={1.9} />
                  <Text style={styles.factText}>{formatLocalizedNumber(beds, language)}</Text>
                </View>
              ) : null}
              {baths !== null ? (
                <View style={styles.fact}>
                  <Bath color={colorTokens.body} size={17} strokeWidth={1.9} />
                  <Text style={styles.factText}>{formatLocalizedNumber(baths, language)}</Text>
                </View>
              ) : null}
              {size ? (
                <View style={styles.fact}>
                  <Maximize2 color={colorTokens.body} size={15} strokeWidth={1.9} />
                  <Text style={styles.factText}>{size}</Text>
                </View>
              ) : null}
            </View>

            <Text numberOfLines={1} style={styles.title}>
              {property.title}
            </Text>

            {property.description ? (
              <Text numberOfLines={compact ? 2 : 3} style={styles.description}>
                {property.description}
              </Text>
            ) : null}

            <View style={styles.spacer} />

            {recency ? (
              <Text numberOfLines={1} style={styles.recency}>
                {t("search.results.addedBy", { recency, name: ownerName })}
              </Text>
            ) : null}
          </Pressable>

          {/* Contact row: siblings of the link above, never inside it. */}
          <View style={styles.contactRow}>
            <View style={styles.owner}>
              <View style={styles.avatar}>
                {property.user?.avatar_url ? (
                  <Image source={{ uri: property.user.avatar_url }} style={styles.fill} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarText}>{initials || "H"}</Text>
                )}
              </View>
              <View style={styles.ownerText}>
                <Text numberOfLines={1} style={styles.ownerName}>
                  {ownerPhone ?? ownerName}
                </Text>
                <Text numberOfLines={1} style={styles.ownerSub}>
                  {property.is_verified ? t("search.results.verifiedListing") : t("search.results.directOwner")}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              {ownerPhone ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("search.results.call")}
                  onPress={call}
                  style={({ hovered }: any) => [styles.iconBtn, hovered && styles.iconBtnHover, webPointer]}
                >
                  <Phone color={colorTokens.ink} size={17} strokeWidth={2} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("search.results.email")}
                onPress={open}
                style={({ hovered }: any) => [styles.iconBtn, hovered && styles.iconBtnHover, webPointer]}
              >
                <Mail color={colorTokens.ink} size={17} strokeWidth={2} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  saved
                    ? t("propertyCard.removeFromSaved", { title: property.title })
                    : t("propertyCard.saveProperty", { title: property.title })
                }
                onPress={() => onSave(property)}
                style={({ hovered }: any) => [styles.saveBtn, hovered && styles.iconBtnHover, webPointer]}
              >
                <Heart
                  color={saved ? colorTokens.saved : colorTokens.ink}
                  fill={saved ? colorTokens.saved : "transparent"}
                  size={17}
                />
                <Text style={styles.saveText}>
                  {saved ? t("propertyCard.saved") : t("propertyCard.save")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export const ResultListingCard = memo(ResultListingCardComponent);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#DDE3E1",
    overflow: "hidden",
  },
  cardHighlighted: {
    borderColor: colorTokens.brand,
    borderWidth: 2,
  },
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colorTokens.brand,
  },
  ribbonText: {
    color: colorTokens.onBrand,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  mediaCol: {
    width: "56%",
  },
  mediaColCompact: {
    width: "46%",
  },
  mediaFrame: {
    height: MEDIA_HEIGHT,
    backgroundColor: colorTokens.surfaceSunken,
    position: "relative",
    overflow: "hidden",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  collage: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  collageMain: {
    flex: 2,
    height: "100%",
  },
  collageSide: {
    flex: 1,
    gap: 2,
  },
  collageThumb: {
    flex: 1,
    width: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderText: {
    color: colorTokens.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  photoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: "rgba(11, 26, 23, 0.72)",
  },
  photoBadgeText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  priceBand: {
    backgroundColor: colorTokens.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceText: {
    color: colorTokens.onInk,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  priceSuffix: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  detailCol: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: colorTokens.divider,
  },
  detailBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 8,
  },
  detailHover: {
    backgroundColor: "#FAFCFB",
  },
  address: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  factsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 4,
  },
  typeText: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  factText: {
    color: colorTokens.body,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  title: {
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  description: {
    color: colorTokens.body,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  spacer: {
    flexGrow: 1,
    minHeight: 4,
  },
  recency: {
    color: colorTokens.brandText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  owner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.xs,
    backgroundColor: colorTokens.ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: colorTokens.onInk,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  ownerText: {
    flexShrink: 1,
    minWidth: 0,
  },
  ownerName: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  ownerSub: {
    color: colorTokens.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnHover: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  saveText: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
