import React, { memo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Building, Clock, Heart } from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  useTranslation,
} from "@/i18n";
import type { StudentAccommodationCardItem } from "@/types/studentAccommodation";
import { toggleSave as apiToggleSave } from "@/api/studentAccommodationApi";

export interface StudentAccommodationCardProps {
  item: StudentAccommodationCardItem;
  onPress?: (item: StudentAccommodationCardItem) => void;
  onSave?: (id: string, newSavedState: boolean) => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
}

function getGenderPolicyStyle(policy: StudentAccommodationCardItem["gender_policy"]) {
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

function StudentAccommodationCardComponent({
  item,
  onPress,
  onSave,
  style,
}: StudentAccommodationCardProps) {
  const { t, language } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(item.is_saved));
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e?: any) => {
    e?.stopPropagation?.();
    if (isSaving) return;

    const nextState = !isSaved;
    setIsSaved(nextState);
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave(item.id, nextState);
      } else {
        await apiToggleSave(item.id);
      }
    } catch {
      setIsSaved(!nextState);
    } finally {
      setIsSaving(false);
    }
  };

  const genderStyle = getGenderPolicyStyle(item.gender_policy);
  const hasImage = Boolean(item.primary_image_url) && !imgFailed;

  const seatBadgeText =
    item.available_seats <= 0
      ? t("studentAccommodation.no_seats_left")
      : item.available_seats === 1
        ? t("studentAccommodation.seats_left_single")
        : t("studentAccommodation.seats_left", {
            count: formatLocalizedNumber(item.available_seats, language),
          });

  const localizedPrice = formatLocalizedPrice(
    item.total_rent,
    item.currency,
    language,
  );
  const priceDisplay = `${localizedPrice} ${t("studentAccommodation.priceSuffix")}`;

  const walkingMinutes = formatLocalizedNumber(
    item.nearest_campus?.walking_time_minutes ?? 0,
    language,
  );
  const walkingSuffix = t("studentAccommodation.walk_distance_suffix");
  const approxTag = item.nearest_campus?.is_approximate
    ? ` ${t("studentAccommodation.approximate")}`
    : "";
  const campusDisplay = `${walkingMinutes} ${walkingSuffix} to ${item.nearest_campus?.university_name ?? ""}${approxTag}`;

  return (
    <View key={item.id} style={[styles.card, style]}>
      {/* Main card clickable area */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.title}
        onPress={() => onPress?.(item)}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Thumbnail Area with Badges */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: item.primary_image_url }}
              style={styles.image}
              contentFit="cover"
              onError={() => setImgFailed(true)}
              accessibilityLabel={item.title}
            />
          ) : (
            <View style={styles.imagePlaceholder} accessibilityLabel="No photo">
              <Building size={36} color={colorTokens.subtle} />
            </View>
          )}

          {/* Gender Policy Badge (Top-Left) */}
          <View
            style={[
              styles.genderBadge,
              { backgroundColor: genderStyle.bg, borderColor: genderStyle.border },
            ]}
          >
            <Text style={[styles.genderBadgeText, { color: genderStyle.text }]}>
              {t(`studentAccommodation.${item.gender_policy}`)}
            </Text>
          </View>
        </View>

        {/* Content Block */}
        <View style={styles.content}>
          {/* Badges Row: Subtype & Seats Left */}
          <View style={styles.metaRow}>
            <View style={styles.subtypeBadge}>
              <Text style={styles.subtypeBadgeText}>
                {t(`studentAccommodation.${item.subtype}`)}
              </Text>
            </View>

            <View
              style={[
                styles.seatBadge,
                item.available_seats <= 0
                  ? styles.seatBadgeSoldOut
                  : item.available_seats === 1
                    ? styles.seatBadgeLow
                    : styles.seatBadgeAvailable,
              ]}
            >
              <Text
                style={[
                  styles.seatBadgeText,
                  item.available_seats <= 0
                    ? styles.seatBadgeTextSoldOut
                    : item.available_seats === 1
                      ? styles.seatBadgeTextLow
                      : styles.seatBadgeTextAvailable,
                ]}
              >
                {seatBadgeText}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Rent */}
          <Text style={styles.price}>{priceDisplay}</Text>

          {/* University Proximity Badge */}
          {item.nearest_campus ? (
            <View style={styles.proximityRow}>
              <Clock size={14} color={colorTokens.muted} />
              <Text style={styles.proximityText} numberOfLines={1}>
                {campusDisplay}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* Save Bookmark Action (Top-Right, sibling to prevent button nesting in DOM) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isSaved
            ? t("studentAccommodation.unsaveAccommodation")
            : t("studentAccommodation.saveAccommodation")
        }
        onPress={handleToggleSave}
        hitSlop={8}
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
      } as ViewStyle,
      default: {
        elevation: 2,
      },
    }),
  },
  cardPressable: {
    minHeight: 44,
    width: "100%",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "opacity 0.15s ease",
      } as ViewStyle,
    }),
  },
  cardPressed: {
    opacity: 0.95,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colorTokens.canvas,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.surfaceSunken,
  },
  genderBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  genderBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.12)",
      } as ViewStyle,
      default: {
        elevation: 2,
      },
    }),
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  content: {
    padding: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  subtypeBadge: {
    backgroundColor: colorTokens.surfaceSunken,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  subtypeBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colorTokens.body,
    lineHeight: 16,
  },
  seatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  seatBadgeAvailable: {
    backgroundColor: colorTokens.brandSurface,
  },
  seatBadgeLow: {
    backgroundColor: colorTokens.notificationSurface,
  },
  seatBadgeSoldOut: {
    backgroundColor: colorTokens.errorSurface,
  },
  seatBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  seatBadgeTextAvailable: {
    color: colorTokens.brandText,
  },
  seatBadgeTextLow: {
    color: colorTokens.notification,
  },
  seatBadgeTextSoldOut: {
    color: colorTokens.errorText,
  },
  title: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colorTokens.ink,
    lineHeight: 22,
  },
  price: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colorTokens.brandText,
    lineHeight: 24,
  },
  proximityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  proximityText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colorTokens.muted,
    flexShrink: 1,
    lineHeight: 16,
  },
});

export const StudentAccommodationCard = memo(StudentAccommodationCardComponent);
export default StudentAccommodationCard;
