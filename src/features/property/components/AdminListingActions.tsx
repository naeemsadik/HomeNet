import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { Archive, MessageSquare } from "@/components/icons";
import { IfPermitted } from "@/components/IfPermitted";
import { useIsModerating } from "@/stores/useAdminContextStore";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useListingModeration } from "../hooks/useListingModeration";
import type { Property } from "../types/property";
import { ListingFeedbackModal } from "./ListingFeedbackModal";

/**
 * Lightweight two-action card moderation pill (`Suggest | Archive`) rendered over
 * a listing's media area beneath the save button.
 *
 * Uses crisp 1px Ink borders and restrained tone separation without heavy blur
 * or drop-shadow bloat.
 */
export function AdminListingActions({ property }: { property: Property }) {
  const armed = useIsModerating();
  if (!armed) return null;

  return (
    <IfPermitted permission="moderate_listing">
      <Controls property={property} />
    </IfPermitted>
  );
}

function Controls({ property }: { property: Property }) {
  const { t } = useTranslation();
  const { archive } = useListingModeration();
  const [busy, setBusy] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const stop = (e?: GestureResponderEvent) => {
    e?.stopPropagation?.();
  };

  const onSuggest = (e: GestureResponderEvent) => {
    stop(e);
    if (busy) return;
    setFeedbackOpen(true);
  };

  const onArchive = async (e: GestureResponderEvent) => {
    stop(e);
    if (busy) return;
    setBusy(true);
    await archive(property);
    setBusy(false);
  };

  return (
    <>
      <View style={styles.pillGroup} pointerEvents="box-none">
        <Pressable
          accessibilityLabel={t("moderation.suggestAria", { title: property.title })}
          accessibilityRole="button"
          disabled={busy}
          hitSlop={4}
          onPress={onSuggest}
          style={({ pressed }) => [
            styles.segmentBtn,
            styles.suggestSegment,
            pressed && styles.segmentPressed,
            busy && styles.busy,
            webPointer,
          ]}
        >
          <MessageSquare color={colorTokens.staffAccentText} size={14} strokeWidth={1.8} />
          <Text style={styles.suggestLabel}>{t("moderation.suggestAction")}</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          accessibilityLabel={t("moderation.archiveLabel", { title: property.title })}
          accessibilityRole="button"
          disabled={busy}
          hitSlop={4}
          onPress={onArchive}
          style={({ pressed }) => [
            styles.segmentBtn,
            styles.archiveSegment,
            pressed && styles.segmentPressed,
            busy && styles.busy,
            webPointer,
          ]}
        >
          <Archive color={colorTokens.onInk} size={14} strokeWidth={1.8} />
          <Text style={styles.label}>{t("moderation.archive")}</Text>
        </Pressable>
      </View>

      <ListingFeedbackModal
        onClose={() => setFeedbackOpen(false)}
        property={{
          id: property.id,
          title: property.title,
          status: property.status,
          areaName: property.area?.name ?? null,
          sellerName: property.user?.full_name ?? null,
        }}
        visible={feedbackOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pillGroup: {
    position: "absolute",
    top: 54,
    right: 12,
    zIndex: 6,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.ink,
    borderWidth: 1,
    borderColor: colorTokens.inkBorderStrong,
    overflow: "hidden",
  },
  segmentBtn: {
    height: "100%",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  suggestSegment: {
    paddingLeft: 13,
  },
  archiveSegment: {
    paddingRight: 13,
  },
  segmentPressed: {
    backgroundColor: colorTokens.inkSurfaceSubtle,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colorTokens.inkBorder,
  },
  busy: {
    opacity: 0.55,
  },
  suggestLabel: {
    color: colorTokens.staffAccentText,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
