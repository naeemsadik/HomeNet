import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { Archive, MessageSquare } from "@/components/icons";
import { IfPermitted } from "@/components/IfPermitted";
import { useIsModerating } from "@/stores/useAdminContextStore";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, shadow, webPointer } from "@/theme";
import { useListingModeration } from "../hooks/useListingModeration";
import type { Property } from "../types/property";
import { ListingFeedbackModal } from "./ListingFeedbackModal";

/**
 * The two moderation actions on a listing card: ask the seller for changes, or
 * archive. Rendered over the photo, only while staff have the Tools switch on
 * and hold `moderate_listing`, so a buyer's card and a moderator's card have
 * the same geometry.
 *
 * There is no delete here. One `DELETE /v1/properties/:id/admin` call on
 * staging was followed by every other listing disappearing; until the backend
 * handler has been checked, the permanent delete is not offered anywhere.
 * Archive is the reversible soft-delete and stays.
 */
export function AdminListingActions({ property, top = 54 }: { property: Property; top?: number }) {
  const armed = useIsModerating();
  if (!armed) return null;

  return (
    <IfPermitted permission="moderate_listing">
      <Controls property={property} top={top} />
    </IfPermitted>
  );
}

function Controls({ property, top }: { property: Property; top: number }) {
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
      <View style={[styles.pillGroup, { top }]} pointerEvents="box-none">
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
          <MessageSquare color={colorTokens.brandText} size={15} strokeWidth={2} />
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
          <Archive color={colorTokens.ink} size={15} strokeWidth={2} />
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
    right: 12,
    zIndex: 6,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.surface,
    overflow: "hidden",
    ...shadow,
  },
  segmentBtn: {
    height: "100%",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  suggestSegment: {},
  archiveSegment: {},
  segmentPressed: { backgroundColor: colorTokens.surfaceSunken },
  divider: { width: 1, height: 18, backgroundColor: colorTokens.divider },
  busy: { opacity: 0.55 },
  suggestLabel: { color: colorTokens.brandText, fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  label: { color: colorTokens.ink, fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
});
