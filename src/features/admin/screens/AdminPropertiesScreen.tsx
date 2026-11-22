import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useAdminProperties, useAdminPropertyMutations } from "../hooks/useAdminProperties";
import { ADMIN_STATUS_FILTERS, PropertyAdminList } from "../components/PropertyAdminList";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ListingFeedbackModal } from "@/features/property/components/ListingFeedbackModal";
import type { Property } from "@/features/property/types/property";
import type { PropertyAdminItem } from "../types/admin";
import { toApiError } from "@/services/apiClient";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTranslation } from "@/i18n";
import { MESS_ENABLED, SELLER_FEEDBACK_ENABLED } from "@/lib/features";
import { listingPath } from "@/lib/listingPath";

/** A ?status= from a link counts only when it names a filter the list has. */
const statusFromLink = (value: string | undefined) =>
  ADMIN_STATUS_FILTERS.find((status) => status === value) ?? "all";

export function AdminPropertiesScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    from?: string;
    highlight?: string;
    id?: string;
    property_id?: string;
    status?: string;
  }>();

  const [status, setStatus] = useState<string>(statusFromLink(params.status));
  const [search, setSearch] = useState("");
  // Mess listings only (PRD 2.5, moderation): shown with the mess module.
  const [messOnly, setMessOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [feedbackProperty, setFeedbackProperty] = useState<PropertyAdminItem | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(
    params.highlight || params.id || params.property_id || null,
  );

  // Another notification opens this same page with a different status and listing.
  useEffect(() => {
    setStatus(statusFromLink(params.status));
    setHighlightId(params.highlight || params.id || params.property_id || null);
  }, [params.status, params.highlight, params.id, params.property_id]);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { data, error, isLoading, refetch, hasNextPage, fetchNextPage } = useAdminProperties({
    status: status === "all" ? undefined : status,
    search: debouncedSearch || undefined,
    subtype: MESS_ENABLED && messOnly ? "mess,seat_share" : undefined,
  });

  const { approveProperty, rejectProperty, deleteProperty } = useAdminPropertyMutations();

  const properties = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteProperty.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
    }
  }

  function handleView(id: string) {
    const listing = properties.find((item) => item.id === id);
    router.push(listingPath({ id, subtype: listing?.subtype }) as never);
  }

  function handleClearHighlight() {
    setHighlightId(null);
    setStatus("all");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("admin.propertyManagement")}</Text>
        <Text style={styles.subtitle}>{t("admin.propertyManagementSubtitle")}</Text>
      </View>

      <PropertyAdminList
        properties={properties}
        total={total}
        isLoading={isLoading}
        isMutating={approveProperty.isPending || rejectProperty.isPending || deleteProperty.isPending}
        activeStatus={status}
        searchQuery={search}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        messOnly={MESS_ENABLED ? messOnly : undefined}
        onMessOnlyChange={MESS_ENABLED ? setMessOnly : undefined}
        onApprove={(id) => approveProperty.mutate(id)}
        onReject={(id) => rejectProperty.mutate(id)}
        onDelete={setDeleteTarget}
        onView={handleView}
        onRequestChanges={SELLER_FEEDBACK_ENABLED ? setFeedbackProperty : undefined}
        onLoadMore={() => void fetchNextPage()}
        hasMore={hasNextPage}
        highlightId={highlightId}
        onClearHighlight={handleClearHighlight}
      />

      {error ? (
        <Text onPress={() => void refetch()} style={styles.errorText}>
          {toApiError(error).message} {t("admin.roles.retry")}
        </Text>
      ) : null}
      {approveProperty.error || rejectProperty.error || deleteProperty.error ? (
        <Text style={styles.errorText}>
          {toApiError(approveProperty.error || rejectProperty.error || deleteProperty.error).message}
        </Text>
      ) : null}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t("admin.deletePropertyTitle")}
        message={t("admin.deletePropertyMessage")}
        confirmLabel={t("admin.actions.delete")}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteProperty.isPending}
      />

      {feedbackProperty ? (
        <ListingFeedbackModal
          visible={!!feedbackProperty}
          property={{
            id: feedbackProperty.id,
            title: feedbackProperty.title,
            status: feedbackProperty.status as Property["status"],
            sellerName: feedbackProperty.user?.full_name,
          }}
          onClose={() => setFeedbackProperty(null)}
          onSuccess={() => {
            setFeedbackProperty(null);
            void refetch();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  header: { gap: 4 },
  title: {
    fontSize: 22,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
  },
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12 },
});
