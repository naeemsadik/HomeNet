import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Archive, Trash2 } from "@/components/icons";
import { IfPermitted } from "@/components/IfPermitted";
import { confirmAction } from "@/lib/alert";
import { useIsModerating } from "@/stores/useAdminContextStore";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useListingModeration } from "../hooks/useListingModeration";
import type { Property } from "../types/property";

/**
 * Whether the irreversible delete is offered.
 *
 * Held off deliberately. On staging, one `DELETE /v1/properties/:id/admin`
 * call naming a single listing was followed by every other listing
 * disappearing as well, across all statuses. That was not proven to be
 * causation from the client, but the endpoint behind this button is the same
 * one, the action has no undo, and the cost of being wrong is a moderator
 * destroying listings they never selected.
 *
 * Archive is unaffected and stays available: it calls `DELETE
 * /v1/properties/:id`, the reversible soft-delete.
 *
 * Set this back to `true` once the backend handler has been checked for a
 * cascade. Nothing else has to change.
 */
const DELETE_ENABLED = false;

/**
 * Moderation controls over a listing's media area, beside the save heart.
 *
 * Absolutely positioned so the card's layout is identical with and without
 * it: a moderating admin and a buyer see the same card geometry, and nothing
 * reflows when moderation is armed.
 *
 * Self-gating — call sites pass a property and nothing else. Showing these is
 * cosmetic; the API authorises every mutation itself.
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
  const { archive, destroy } = useListingModeration();
  const [busy, setBusy] = useState(false);

  const onArchive = async () => {
    if (busy) return;
    setBusy(true);
    await archive(property);
    setBusy(false);
  };

  // Irreversible, so it asks first. `confirmAction` is a blocking dialog on
  // both platforms; on web it is the browser's own, which cannot be styled.
  const onDelete = async () => {
    if (busy) return;
    const ok = await confirmAction(
      t("moderation.deleteTitle"),
      t("moderation.deleteMessage", { title: property.title }),
      { confirmLabel: t("moderation.deleteConfirm"), destructive: true },
    );
    if (!ok) return;
    setBusy(true);
    await destroy(property);
    setBusy(false);
  };

  return (
    <View style={styles.strip} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("moderation.archiveLabel", { title: property.title })}
        disabled={busy}
        onPress={onArchive}
        style={[styles.button, busy && styles.busy, webPointer]}
      >
        <Archive color={colorTokens.onInk} size={15} strokeWidth={2.2} />
        <Text style={styles.label}>{t("moderation.archive")}</Text>
      </Pressable>

      {DELETE_ENABLED ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("moderation.deleteLabel", { title: property.title })}
        disabled={busy}
        onPress={onDelete}
        style={[styles.button, styles.destructive, busy && styles.busy, webPointer]}
      >
        <Trash2 color={colorTokens.onDanger} size={15} strokeWidth={2.2} />
      </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    // Ink is the one surface the public interface never uses for an action, so
    // these read as system controls rather than as something for the buyer.
    backgroundColor: colorTokens.ink,
  },
  destructive: { backgroundColor: colorTokens.errorText, paddingHorizontal: 10 },
  busy: { opacity: 0.6 },
  label: {
    color: colorTokens.onInk,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
});
