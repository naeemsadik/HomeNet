import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Archive, ArchiveRestore, CheckCircle2, Edit, Eye, Send, Trash2, type LucideIcon } from "@/components/icons";
import { SUPPORT_EMAIL } from "@/content/legal";
import { useConfirmSeatListing } from "@/features/mess/components/SeatListingTools";
import { messKeys } from "@/features/mess/hooks/messKeys";
import { useArchiveMess, useDeleteMess, usePublishMess } from "@/features/mess/hooks/useMessMutations";
import { useTranslation } from "@/i18n";
import { confirmAction, notify } from "@/lib/alert";
import { OWNER_UNARCHIVE_ENABLED } from "@/lib/features";
import { openExternalUrl } from "@/lib/safeUrl";
import { toApiError } from "@/services/apiClient";
import { useArchiveProperty, useDeleteProperty, usePublishProperty, useUnarchiveProperty } from "../../hooks/usePropertyMutations";
import { canArchive, isSharedLiving } from "../../utils/myListings";
import type { ListingView } from "./listingView";

export type ListingActionKey = "confirm" | "edit" | "view" | "publish" | "archive" | "restore" | "delete";

export interface ListingAction {
  key: ListingActionKey;
  label: string;
  /** The label with the listing named, for a screen reader moving between rows. */
  accessibilityLabel: string;
  icon: LucideIcon;
  tone: "default" | "brand" | "danger";
  /** Edit and View go somewhere; the rest act in place. */
  href?: string;
  run: () => void | Promise<void>;
}

/**
 * What an owner can do to one listing, in menu order. A seat listing goes
 * through the mess API, the rest through the property API; both ask the same
 * questions first.
 */
export function useListingActions() {
  const { t } = useTranslation();
  const deleteProperty = useDeleteProperty();
  const archiveProperty = useArchiveProperty();
  const unarchiveProperty = useUnarchiveProperty();
  const publishProperty = usePublishProperty();
  const deleteMess = useDeleteMess();
  const archiveMess = useArchiveMess();
  const publishMess = usePublishMess();
  const { confirm: confirmSeat, pendingId: confirmingId } = useConfirmSeatListing();
  const client = useQueryClient();

  const isSeat = (view: ListingView) => view.row.kind === "seat";

  /**
   * A shared-living listing changed through the property API (a restore, or a mess
   * listing whose seat details did not load): the mess pages show it too, and the
   * property mutations do not refresh them.
   */
  const refreshMess = (view: ListingView) => {
    if (isSharedLiving(view.row)) void client.invalidateQueries({ queryKey: messKeys.all });
  };

  const remove = async (view: ListingView) => {
    const confirmed = await confirmAction(t("seller.deleteConfirmTitle"), t("seller.deleteConfirmMessage", { title: view.title }), {
      confirmLabel: t("seller.actions.delete"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      if (isSeat(view)) await deleteMess.mutateAsync(view.id);
      else {
        await deleteProperty.mutateAsync(view.id);
        refreshMess(view);
      }
    } catch (error) {
      notify(t("seller.deleteFailed"), toApiError(error).message);
    }
  };

  const publish = async (view: ListingView) => {
    try {
      if (isSeat(view)) await publishMess.mutateAsync(view.id);
      else {
        await publishProperty.mutateAsync(view.id);
        refreshMess(view);
      }
    } catch (error) {
      notify(t("seller.publishFailed"), toApiError(error).message);
    }
  };

  const archive = async (view: ListingView) => {
    const confirmed = await confirmAction(
      t("seller.archiveConfirmTitle"),
      // Owners can't restore an archive themselves yet, so say so before they do it.
      t(OWNER_UNARCHIVE_ENABLED ? "seller.archiveConfirmMessage" : "seller.archiveConfirmMessageNoUndo", { title: view.title }),
      { confirmLabel: t("seller.actions.archive") },
    );
    if (!confirmed) return;
    try {
      if (isSeat(view)) await archiveMess.mutateAsync(view.id);
      else {
        await archiveProperty.mutateAsync(view.id);
        refreshMess(view);
      }
    } catch (error) {
      notify(t("seller.archiveFailed"), toApiError(error).message);
    }
  };

  // Until the API lets owners restore their own archive (OWNER_UNARCHIVE_ENABLED),
  // "Ask to restore" opens an email to support naming the listing, instead of a
  // restore call that would report success and change nothing.
  const restore = async (view: ListingView) => {
    if (!OWNER_UNARCHIVE_ENABLED) {
      const confirmed = await confirmAction(t("seller.restoreViaSupportTitle"), t("seller.restoreViaSupportMessage", { title: view.title }), {
        confirmLabel: t("seller.restoreViaSupportConfirm"),
      });
      if (!confirmed) return;
      const subject = encodeURIComponent(t("seller.restoreViaSupportSubject"));
      const body = encodeURIComponent(`${view.title}\nListing ID: ${view.id}`);
      openExternalUrl(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
      return;
    }
    const confirmed = await confirmAction(t("seller.unarchiveConfirmTitle"), t("seller.unarchiveConfirmMessage", { title: view.title }), {
      confirmLabel: t("seller.actions.unarchive"),
    });
    if (!confirmed) return;
    try {
      // A seat listing is a Property row, so the property restore covers both. Its
      // row reads its status from the seat list, which the property restore leaves stale.
      await unarchiveProperty.mutateAsync(view.id);
      refreshMess(view);
    } catch (error) {
      notify(t("seller.unarchiveFailed"), toApiError(error).message);
    }
  };

  /** Every action that applies to this listing now, in the order the menu lists them. */
  const actionsFor = (view: ListingView): ListingAction[] => {
    const named = (label: string) => t("seller.actionOn", { action: label, title: view.title });
    const action = (key: ListingActionKey, label: string, icon: LucideIcon, tone: ListingAction["tone"], run: ListingAction["run"], href?: string): ListingAction => ({
      key,
      label,
      accessibilityLabel: named(label),
      icon,
      tone,
      href,
      run,
    });
    const list: ListingAction[] = [];
    if (view.seat && view.status === "active") {
      list.push(action("confirm", t("mess.my.confirm"), CheckCircle2, "brand", () => confirmSeat(view.id)));
    }
    if (view.readyToPublish) list.push(action("publish", t("seller.actions.publish"), Send, "brand", () => publish(view)));
    list.push(action("edit", view.editLabel, Edit, "brand", () => router.push(view.editHref as never), view.editHref));
    // As on the old seat screen, a seat listing offers View only while live or in review:
    // an archived or declined one would open looking live, with nothing to say it is hidden.
    if (!view.seat || view.status === "active" || view.status === "pending") {
      list.push(action("view", t("seller.actions.view"), Eye, "default", () => router.push(view.href as never), view.href));
    }
    if (view.status === "archived") {
      list.push(action("restore", t(OWNER_UNARCHIVE_ENABLED ? "seller.actions.unarchive" : "seller.actions.askToRestore"), ArchiveRestore, "brand", () => restore(view)));
    } else if (canArchive(view.status)) {
      list.push(action("archive", t("seller.actions.archive"), Archive, "default", () => archive(view)));
    }
    list.push(action("delete", t("seller.actions.delete"), Trash2, "danger", () => remove(view)));
    return list;
  };

  return { actionsFor, confirmingId };
}
