import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useAdminProperties, useAdminPropertyMutations } from "../hooks/useAdminProperties";
import { PropertyAdminList } from "../components/PropertyAdminList";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toApiError } from "@/services/apiClient";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTranslation } from "@/i18n";

export function AdminPropertiesScreen() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { data, error, isLoading, refetch, hasNextPage, fetchNextPage } = useAdminProperties({
    status: status === "all" ? undefined : status,
    search: debouncedSearch || undefined,
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
    router.push(`/property/${id}` as never);
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
        onApprove={(id) => approveProperty.mutate(id)}
        onReject={(id) => rejectProperty.mutate(id)}
        onDelete={setDeleteTarget}
        onView={handleView}
        onLoadMore={() => void fetchNextPage()}
        hasMore={hasNextPage}
      />
      {error ? (
        <Text onPress={() => void refetch()} style={styles.errorText}>
          {toApiError(error).message} Press to retry.
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
