import type { ComponentProps } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Building2, Check, Clock, Eye, MessageSquare, RotateCcw, Trash2, UserRound } from "@/components/icons";
import { cdnImage } from "@/lib/cloudinaryImage";
import { colorTokens, fontTokens, radius, webPointer } from "@/theme";
import { PropertyStatusBadge } from "./StatusBadge";
import type { PropertyAdminItem } from "../types/admin";
import { NoTranslateText } from "@/components/NoTranslateText";
import { isPriceOnRequest, priceOnRequestLabel, useTranslation, formatLocalizedNumber } from "@/i18n";
import { isMessSubtype } from "@/lib/listingPath";
import { useResponsive } from "@/hooks/useResponsive";

type PressState = { pressed: boolean; hovered?: boolean };

export interface PropertyAdminItemProps {
  item: PropertyAdminItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onRequestChanges?: (item: PropertyAdminItem) => void;
  isMutating?: boolean;
  /** The listing a notification pointed at: its card gets the brand outline. */
  isHighlighted?: boolean;
}

export function PropertyAdminItemRow({
  item,
  onApprove,
  onReject,
  onDelete,
  onView,
  onRequestChanges,
  isMutating = false,
  isHighlighted = false,
}: PropertyAdminItemProps) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const thumbnail = item.media?.[0]?.thumbnail_url ?? item.media?.[0]?.url;

  const formattedDate = new Date(item.created_at).toLocaleDateString(
    language === "bn" ? "bn-BD" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  const priceText = isPriceOnRequest(item.price)
    ? priceOnRequestLabel(language)
    : `${item.price_currency || "BDT"} ${formatLocalizedNumber(item.price, language)}`;

  const isPending = item.status === "pending";
  const isActive = item.status === "active";

  return (
    <View style={[styles.card, isHighlighted && styles.cardHighlighted]}>
      <View style={[styles.mainRow, isPhone && styles.mainRowPhone]}>
        <View style={styles.thumbnailWrap}>
          {thumbnail ? (
            <Image
              source={{ uri: cdnImage(thumbnail, 240) }}
              accessibilityLabel={item.title}
              style={styles.thumbnail}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Building2 color={colorTokens.textMuted} size={24} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {isMessSubtype(item.subtype) ? (
            <Text style={styles.kindTag}>
              {t(
                item.subtype?.trim().toLowerCase() === "seat_share"
                  ? "mess.subtype.seat_share"
                  : "mess.subtype.mess",
              )}
            </Text>
          ) : null}

          <NoTranslateText style={styles.price}>{priceText}</NoTranslateText>

          <View style={styles.metaRow}>
            {item.user ? (
              <View style={styles.metaItem}>
                <UserRound color={colorTokens.textMuted} size={12} strokeWidth={2} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.user.full_name}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Clock color={colorTokens.textMuted} size={12} strokeWidth={2} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusWrap}>
          <PropertyStatusBadge status={item.status as ComponentProps<typeof PropertyStatusBadge>["status"]} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <View style={styles.actionGroup}>
          {isPending ? (
            <>
              <Pressable
                onPress={() => onApprove(item.id)}
                style={({ pressed, hovered }: PressState) => [
                  styles.actionBtn,
                  styles.activateBtn,
                  hovered && styles.activateBtnHovered,
                  pressed && styles.actionBtnPressed,
                  webPointer,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("admin.actions.activateAria")}
                disabled={isMutating}
              >
                <Check color={colorTokens.primary} size={14} strokeWidth={2.2} />
                <Text style={[styles.actionText, { color: colorTokens.primary }]}>
                  {t("admin.actions.activate")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onReject(item.id)}
                style={({ pressed, hovered }: PressState) => [
                  styles.actionBtn,
                  styles.draftBtn,
                  hovered && styles.draftBtnHovered,
                  pressed && styles.actionBtnPressed,
                  webPointer,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("admin.actions.moveToDraftAria")}
                disabled={isMutating}
              >
                <RotateCcw color={colorTokens.warning} size={13} strokeWidth={2.2} />
                <Text style={[styles.actionText, { color: colorTokens.warning }]}>
                  {t("admin.actions.moveToDraft")}
                </Text>
              </Pressable>
            </>
          ) : null}

          {(isPending || isActive) && onRequestChanges ? (
            <Pressable
              onPress={() => onRequestChanges(item)}
              style={({ pressed, hovered }: PressState) => [
                styles.actionBtn,
                styles.feedbackBtn,
                hovered && styles.feedbackBtnHovered,
                pressed && styles.actionBtnPressed,
                webPointer,
              ]}
              accessibilityRole="button"
                accessibilityLabel={t("admin.actions.requestChangesAria")}
              disabled={isMutating}
            >
              <MessageSquare color={colorTokens.textPrimary} size={13} strokeWidth={2} />
              <Text style={[styles.actionText, { color: colorTokens.textPrimary }]}>
                {t("admin.actions.requestChanges")}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => onView(item.id)}
            style={({ pressed, hovered }: PressState) => [
              styles.actionBtn,
              styles.viewBtn,
              hovered && styles.viewBtnHovered,
              pressed && styles.actionBtnPressed,
              webPointer,
            ]}
            accessibilityRole="button"
                accessibilityLabel={t("admin.actions.viewAria")}
          >
            <Eye color={colorTokens.verified} size={14} strokeWidth={2} />
            <Text style={[styles.actionText, { color: colorTokens.verified }]}>
              {t("admin.actions.view")}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => onDelete(item.id)}
          style={({ pressed, hovered }: PressState) => [
            styles.deleteBtn,
            hovered && styles.deleteBtnHovered,
            pressed && styles.actionBtnPressed,
            webPointer,
          ]}
          accessibilityRole="button"
                accessibilityLabel={t("admin.actions.deleteAria")}
          disabled={isMutating}
        >
          <Trash2 color={colorTokens.error} size={14} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    gap: 12,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: colorTokens.brand,
    backgroundColor: colorTokens.brandSurface,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  mainRowPhone: {
    gap: 12,
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
  },
  thumbnail: {
    width: 72,
    height: 72,
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
    lineHeight: 20,
  },
  statusWrap: {
    alignItems: "flex-end",
  },
  kindTag: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.brandText,
    backgroundColor: colorTokens.brandSurface,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colorTokens.cardBorder,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activateBtn: {
    backgroundColor: colorTokens.primaryLight,
    borderColor: colorTokens.primaryLight,
  },
  activateBtnHovered: {
    opacity: 0.9,
  },
  draftBtn: {
    backgroundColor: colorTokens.warningLight,
    borderColor: colorTokens.warningLight,
  },
  draftBtnHovered: {
    opacity: 0.9,
  },
  feedbackBtn: {
    backgroundColor: colorTokens.backgroundAlt,
    borderColor: colorTokens.cardBorder,
  },
  feedbackBtnHovered: {
    backgroundColor: colorTokens.cardBorder,
  },
  viewBtn: {
    backgroundColor: colorTokens.verifiedLight,
    borderColor: colorTokens.verifiedLight,
  },
  viewBtnHovered: {
    opacity: 0.9,
  },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.errorLight,
  },
  deleteBtnHovered: {
    opacity: 0.85,
  },
  actionBtnPressed: {
    opacity: 0.75,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
  },
});
