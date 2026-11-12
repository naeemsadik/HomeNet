import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Archive, ArchiveRestore, Check, ChevronDown, MessageSquare, X } from "@/components/icons";
import { IfPermitted } from "@/components/IfPermitted";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useIsModerating } from "@/stores/useAdminContextStore";
import { colorTokens, fonts, layout, radius, shadow, webPointer, brandButtonState } from "@/theme";
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

/** What a status is called, and the dot beside it. A draft is a draft: nobody may have reviewed it. */
const STATUS_META: Record<PropertyStatus, { labelKey: TranslationKey; dot: string }> = {
  active: { labelKey: "moderation.statusActive", dot: colorTokens.brand },
  pending: { labelKey: "moderation.statusPending", dot: colorTokens.warningText },
  draft: { labelKey: "moderation.statusDraft", dot: colorTokens.muted },
  archived: { labelKey: "moderation.statusArchived", dot: colorTokens.subtle },
  sold: { labelKey: "moderation.statusSold", dot: colorTokens.muted },
};

/** The statuses a moderator may set by hand. Sold is the owner's to say. */
const SETTABLE: PropertyStatus[] = ["active", "pending", "draft", "archived"];

/**
 * Moderation bar on a listing page: its status, one primary action (ask the
 * seller for changes) and one secondary (archive or restore).
 *
 * Shown only while the staff strip's "Tools" switch is on, the same rule the
 * listing cards follow, and only to holders of `moderate_listing`. There is no
 * edit and no delete here: a moderator never rewrites a seller's copy, and the
 * permanent delete stays off until the backend handler has been checked (see
 * `useListingModeration.destroy`).
 */
export function AdminPropertyCommandDeck({ property }: AdminPropertyCommandDeckProps) {
  const armed = useIsModerating();
  if (!armed) return null;
  return (
    <IfPermitted permission="moderate_listing">
      <CommandDeckInner property={property} />
    </IfPermitted>
  );
}

function CommandDeckInner({ property }: AdminPropertyCommandDeckProps) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const { archive, restore, updateStatus } = useListingModeration();

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<"status" | "archive" | null>(null);

  const isArchived = property.status === "archived";
  const isBusy = busyAction !== null;
  const current = STATUS_META[property.status] ?? STATUS_META.draft;
  const currentLabel = t(current.labelKey);

  const handleStatusSelect = async (next: PropertyStatus) => {
    setStatusMenuOpen(false);
    if (next === property.status || isBusy) return;
    setBusyAction("status");
    await updateStatus(property, next);
    setBusyAction(null);
  };

  const handleArchiveOrRestore = async () => {
    if (isBusy) return;
    setBusyAction("archive");
    await (isArchived ? restore(property) : archive(property));
    setBusyAction(null);
  };

  const ArchiveIcon = isArchived ? ArchiveRestore : Archive;

  return (
    <>
      <View style={[styles.wrapper, isPhone && styles.wrapperPhone]} pointerEvents="box-none">
        <View style={[styles.deck, isPhone && styles.deckPhone]}>
          <View style={styles.statusSide}>
            {!isPhone ? <Text style={styles.deckLabel}>{t("moderation.commandDeckTitle")}</Text> : null}
            <Pressable
              accessibilityLabel={t("moderation.switchStatusAria", { status: currentLabel })}
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => setStatusMenuOpen(true)}
              style={({ pressed }) => [
                styles.statusBtn,
                isPhone && styles.grow,
                pressed && styles.pressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              {busyAction === "status" ? (
                <ActivityIndicator color={colorTokens.ink} size="small" />
              ) : (
                <View style={[styles.dot, { backgroundColor: current.dot }]} />
              )}
              <Text numberOfLines={1} style={styles.statusBtnText}>
                {currentLabel}
              </Text>
              <ChevronDown color={colorTokens.muted} size={16} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={[styles.actions, isPhone && styles.actionsPhone]}>
            <Pressable
              accessibilityLabel={
                isArchived ? t("moderation.restore") : t("moderation.archiveLabel", { title: property.title })
              }
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleArchiveOrRestore}
              style={({ pressed }) => [
                styles.secondaryBtn,
                isPhone && styles.grow,
                pressed && styles.pressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              {busyAction === "archive" ? (
                <ActivityIndicator color={colorTokens.ink} size="small" />
              ) : (
                <ArchiveIcon color={colorTokens.ink} size={16} strokeWidth={2} />
              )}
              <Text style={styles.secondaryText}>
                {isArchived ? t("moderation.restore") : t("moderation.archive")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t("moderation.suggestAria", { title: property.title })}
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => setFeedbackOpen(true)}
              style={({ pressed }) => [
                styles.primaryBtn,
                isPhone && styles.grow,
                pressed && styles.primaryPressed,
                isBusy && styles.busy,
                webPointer,
              ]}
            >
              <MessageSquare color={colorTokens.onBrand} size={16} strokeWidth={2} />
              <Text numberOfLines={1} style={styles.primaryText}>
                {t("moderation.suggestActionFull")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setStatusMenuOpen(false)}
        transparent
        visible={statusMenuOpen}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel={t("common.close")}
            accessibilityRole="button"
            onPress={() => setStatusMenuOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View accessibilityRole="radiogroup" accessibilityViewIsModal style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>{t("moderation.statusLabel")}</Text>
              <Pressable
                accessibilityLabel={t("common.close")}
                accessibilityRole="button"
                onPress={() => setStatusMenuOpen(false)}
                style={({ pressed }) => [styles.menuClose, pressed && styles.pressed, webPointer]}
              >
                <X color={colorTokens.ink} size={18} strokeWidth={2} />
              </Pressable>
            </View>
            {SETTABLE.map((status) => {
              const selected = property.status === status;
              const label = t(STATUS_META[status].labelKey);
              return (
                <Pressable
                  key={status}
                  accessibilityLabel={label}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => void handleStatusSelect(status)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                    webPointer,
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: STATUS_META[status].dot }]} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
                  {selected ? <Check color={colorTokens.brandText} size={18} strokeWidth={2.4} /> : null}
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
  wrapper: { width: "100%", maxWidth: 760, paddingHorizontal: layout.gutter, alignItems: "center" },
  wrapperPhone: { paddingHorizontal: 12 },
  deck: {
    width: "100%",
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    ...shadow,
  },
  deckPhone: { flexDirection: "column", alignItems: "stretch", gap: 8 },
  statusSide: { flexDirection: "row", alignItems: "center", gap: 12 },
  deckLabel: { color: colorTokens.muted, fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  statusBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.surfaceSunken,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBtnText: { flexShrink: 1, color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionsPhone: { alignItems: "stretch" },
  grow: { flex: 1, justifyContent: "center" },
  secondaryBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.surface,
    borderWidth: 1.5,
    borderColor: colorTokens.muted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: { color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  primaryBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryPressed: brandButtonState.pressed,
  primaryText: { color: colorTokens.onBrand, fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.7 },
  busy: { opacity: 0.55 },
  overlay: {
    flex: 1,
    backgroundColor: colorTokens.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menu: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    padding: 12,
    gap: 4,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 8,
    paddingBottom: 4,
  },
  menuTitle: { color: colorTokens.ink, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  menuClose: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  option: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionSelected: { backgroundColor: colorTokens.brandSurface },
  optionText: { flex: 1, color: colorTokens.body, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  optionTextSelected: { color: colorTokens.ink, fontFamily: fonts.semiBold },
});
