import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
} from "@/components/icons";
import { IfPermitted } from "@/components/IfPermitted";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";
import type { PropertyStatus } from "@/types/api";
import { useListingModeration } from "../hooks/useListingModeration";
import { ListingFeedbackModal } from "./ListingFeedbackModal";

export interface AdminPropertyCommandDeckProps {
  property: {
    id: string;
    title: string;
    status: PropertyStatus;
    areaName?: string | null;
    sellerName?: string | null;
  };
}

const STATUS_OPTIONS = [
  { status: "active", labelKey: "moderation.statusActive", dotColor: colorTokens.onInk },
  { status: "pending", labelKey: "moderation.statusPending", dotColor: colorTokens.staffAccent },
  { status: "draft", labelKey: "moderation.statusChangesRequested", dotColor: colorTokens.staffAccentText },
  { status: "archived", labelKey: "moderation.statusArchived", dotColor: colorTokens.onInkMuted },
] as const;

function statusLabelKey(status: PropertyStatus) {
  switch (status) {
    case "active":
      return "moderation.statusActive" as const;
    case "pending":
      return "moderation.statusPending" as const;
    case "draft":
      return "moderation.statusChangesRequested" as const;
    case "archived":
      return "moderation.statusArchived" as const;
    case "sold":
      return "moderation.statusSold" as const;
  }
}

function statusDotColor(status: PropertyStatus): string {
  switch (status) {
    case "active":
      return colorTokens.onInk;
    case "pending":
      return colorTokens.staffAccent;
    case "draft":
      return colorTokens.staffAccentText;
    case "sold":
      return colorTokens.infoSurface;
    case "archived":
    default:
      return colorTokens.onInkMuted;
  }
}

/**
 * In-page Staff Command Deck for PropertyDetailScreen.
 *
 * Enforces Least Privilege (no direct editing of seller copy) and lives in
 * the Ink / Slate control channel using crisp 1px borders and subtle surface
 * tone shifts rather than heavy blur shadows.
 */
export function AdminPropertyCommandDeck({ property }: AdminPropertyCommandDeckProps) {
  return (
    <IfPermitted permission="moderate_listing">
      <CommandDeckInner property={property} />
    </IfPermitted>
  );
}

function CommandDeckInner({ property }: AdminPropertyCommandDeckProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { archive, restore, updateStatus, destroy } = useListingModeration();

  const [collapsed, setCollapsed] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const isArchived = property.status === "archived";
  const isBusy = busyAction !== null;
  const currentStatusLabel = t(statusLabelKey(property.status));

  const handleStatusSelect = async (nextStatus: PropertyStatus) => {
    setStatusMenuOpen(false);
    if (nextStatus === property.status || isBusy) return;
    setBusyAction("status");
    await updateStatus(property, nextStatus);
    setBusyAction(null);
  };

  const handleArchiveOrRestore = async () => {
    if (isBusy) return;
    setBusyAction("archive");
    if (isArchived) {
      await restore(property);
    } else {
      await archive(property);
    }
    setBusyAction(null);
  };

  const handleDelete = async () => {
    if (isBusy) return;
    const confirmed = await confirmAction(
      t("moderation.deleteTitle"),
      t("moderation.deleteMessage", { title: property.title }),
      { confirmLabel: t("moderation.deleteConfirm"), destructive: true },
    );
    if (!confirmed) return;
    setBusyAction("delete");
    const deleted = await destroy(property);
    setBusyAction(null);
    if (deleted) {
      router.back();
    }
  };

  if (collapsed) {
    return (
      <View style={styles.collapsedWrap} pointerEvents="box-none">
        <Pressable
          accessibilityLabel={t("moderation.expandDeck")}
          accessibilityRole="button"
          onPress={() => setCollapsed(false)}
          style={({ pressed }) => [
            styles.collapsedPill,
            pressed && styles.pressed,
            webPointer,
          ]}
        >
          <View style={[styles.dot, { backgroundColor: statusDotColor(property.status) }]} />
          <SlidersHorizontal color={colorTokens.onInk} size={14} strokeWidth={1.8} />
          <Text style={styles.collapsedText}>{t("moderation.expandDeck")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.wrapper, isPhone && styles.wrapperPhone]} pointerEvents="box-none">
        <View style={[styles.deck, isPhone && styles.deckPhone]}>
          {/* Left: Context + Status Switcher */}
          <View style={[styles.leftSection, isPhone && styles.leftSectionPhone]}>
            <View style={styles.brandCluster}>
              <ShieldCheck color={colorTokens.onInkMuted} size={14} strokeWidth={1.8} />
              {!isPhone ? (
                <Text style={styles.deckLabel}>{t("moderation.commandDeckTitle")}</Text>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel={t("moderation.switchStatusAria", { status: currentStatusLabel })}
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => setStatusMenuOpen(true)}
              style={({ pressed }) => [
                styles.statusBtn,
                pressed && styles.btnPressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              {busyAction === "status" ? (
                <ActivityIndicator color={colorTokens.onInk} size="small" />
              ) : (
                <View style={[styles.dot, { backgroundColor: statusDotColor(property.status) }]} />
              )}
              <Text numberOfLines={1} style={styles.statusBtnText}>
                {currentStatusLabel}
              </Text>
              <ChevronDown color={colorTokens.onInkMuted} size={14} strokeWidth={1.8} />
            </Pressable>

            {isPhone ? (
              <Pressable
                accessibilityLabel={t("moderation.collapseDeck")}
                accessibilityRole="button"
                hitSlop={4}
                onPress={() => setCollapsed(true)}
                style={({ pressed }) => [
                  styles.collapseIconBtn,
                  pressed && styles.btnPressed,
                  webPointer,
                ]}
              >
                <ChevronDown color={colorTokens.onInkMuted} size={16} strokeWidth={1.8} />
              </Pressable>
            ) : null}
          </View>

          {/* Right: Request Changes · Archive/Restore · Guarded Delete */}
          <View style={[styles.actionsSection, isPhone && styles.actionsSectionPhone]}>
            <Pressable
              accessibilityLabel={t("moderation.suggestAria", { title: property.title })}
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => setFeedbackOpen(true)}
              style={({ pressed }) => [
                styles.suggestBtn,
                isPhone && styles.suggestBtnPhone,
                pressed && styles.btnPressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              <MessageSquare color={colorTokens.staffAccentText} size={16} strokeWidth={1.8} />
              <Text numberOfLines={1} style={styles.suggestBtnText}>
                {t("moderation.suggestActionFull")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={
                isArchived
                  ? t("moderation.restore")
                  : t("moderation.archiveLabel", { title: property.title })
              }
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleArchiveOrRestore}
              style={({ pressed }) => [
                styles.actionBtn,
                isPhone && styles.actionBtnPhone,
                pressed && styles.btnPressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              {busyAction === "archive" ? (
                <ActivityIndicator color={colorTokens.onInk} size="small" />
              ) : isArchived ? (
                <ArchiveRestore color={colorTokens.onInk} size={16} strokeWidth={1.8} />
              ) : (
                <Archive color={colorTokens.onInk} size={16} strokeWidth={1.8} />
              )}
              <Text style={styles.actionText}>
                {isArchived ? t("moderation.restore") : t("moderation.archive")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t("moderation.deleteLabel", { title: property.title })}
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.pressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              {busyAction === "delete" ? (
                <ActivityIndicator color={colorTokens.onDanger} size="small" />
              ) : (
                <Trash2 color={colorTokens.onDanger} size={16} strokeWidth={1.8} />
              )}
            </Pressable>

            {!isPhone ? (
              <Pressable
                accessibilityLabel={t("moderation.collapseDeck")}
                accessibilityRole="button"
                hitSlop={4}
                onPress={() => setCollapsed(true)}
                style={({ pressed }) => [
                  styles.collapseIconBtn,
                  pressed && styles.btnPressed,
                  webPointer,
                ]}
              >
                <ChevronDown color={colorTokens.onInkMuted} size={16} strokeWidth={1.8} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {/* Status Switcher Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setStatusMenuOpen(false)}
        transparent
        visible={statusMenuOpen}
      >
        <View style={styles.statusModalOverlay}>
          <Pressable
            accessibilityLabel={t("common.close")}
            accessibilityRole="button"
            onPress={() => setStatusMenuOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View accessibilityViewIsModal style={styles.statusMenuCard}>
            <View style={styles.statusMenuHeader}>
              <Text style={styles.statusMenuTitle}>{t("moderation.statusLabel")}</Text>
              <Pressable
                accessibilityLabel={t("common.close")}
                accessibilityRole="button"
                onPress={() => setStatusMenuOpen(false)}
                style={[styles.statusMenuClose, webPointer]}
              >
                <X color={colorTokens.onInk} size={18} strokeWidth={1.8} />
              </Pressable>
            </View>
            {STATUS_OPTIONS.map((option) => {
              const selected = property.status === option.status;
              const label = t(option.labelKey);
              return (
                <Pressable
                  key={option.status}
                  accessibilityLabel={label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => void handleStatusSelect(option.status)}
                  style={({ pressed }) => [
                    styles.statusOption,
                    selected && styles.statusOptionSelected,
                    pressed && styles.btnPressed,
                    webPointer,
                  ]}
                >
                  <View style={styles.statusOptionLeft}>
                    <View style={[styles.dot, { backgroundColor: option.dotColor }]} />
                    <Text style={[styles.statusOptionText, selected && styles.statusOptionTextSelected]}>
                      {label}
                    </Text>
                  </View>
                  {selected ? (
                    <Check color={colorTokens.onInk} size={16} strokeWidth={2} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      <ListingFeedbackModal
        onClose={() => setFeedbackOpen(false)}
        property={property}
        visible={feedbackOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 820,
    paddingHorizontal: layout.gutter,
    alignItems: "center",
  },
  wrapperPhone: {
    paddingHorizontal: 12,
  },
  deck: {
    width: "100%",
    backgroundColor: colorTokens.ink,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  deckPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leftSectionPhone: {
    justifyContent: "space-between",
  },
  brandCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deckLabel: {
    color: colorTokens.onInkMuted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  statusBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkElevated,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusBtnText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsSectionPhone: {
    justifyContent: "space-between",
    gap: 8,
  },
  suggestBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colorTokens.inkElevated,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  suggestBtnPhone: {
    flex: 1.4,
    paddingHorizontal: 10,
  },
  suggestBtnText: {
    color: colorTokens.staffAccentText,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  actionBtn: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: colorTokens.inkSurfaceSubtle,
    borderWidth: 1,
    borderColor: colorTokens.inkBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnPhone: {
    flex: 1,
    paddingHorizontal: 10,
  },
  actionText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colorTokens.errorText,
    alignItems: "center",
    justifyContent: "center",
  },
  collapseIconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.inkSurfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedWrap: {
    paddingHorizontal: layout.gutter,
    alignItems: "center",
  },
  collapsedPill: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.ink,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  collapsedText: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  btnPressed: {
    backgroundColor: colorTokens.inkBorderStrong,
  },
  pressed: {
    opacity: 0.85,
  },
  busy: {
    opacity: 0.55,
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusMenuCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colorTokens.ink,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    padding: 12,
    gap: 6,
  },
  statusMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.inkBorder,
  },
  statusMenuTitle: {
    color: colorTokens.onInk,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  statusMenuClose: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.inkSurfaceSubtle,
  },
  statusOption: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusOptionSelected: {
    backgroundColor: colorTokens.inkElevated,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
  },
  statusOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusOptionText: {
    color: colorTokens.onInkMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  statusOptionTextSelected: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
  },
});
