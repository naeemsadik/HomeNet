import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@/theme";
import { useAdminProperties, useAdminPropertyMutations } from "../hooks/useAdminProperties";
import { PropertyAdminList } from "../components/PropertyAdminList";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function AdminPropertiesScreen() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useAdminProperties({
    status: status === "all" ? undefined : status,
    search: search || undefined,
    page,
    limit: 20,
  });

  const { approveProperty, rejectProperty, deleteProperty } = useAdminPropertyMutations();

  const properties = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = properties.length < total;

  function handleApprove(id: string) {
    approveProperty.mutate(id);
  }

  function handleReject(id: string) {
    rejectProperty.mutate(id);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteProperty.mutate(deleteTarget, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  }

  function handleView(id: string) {
    router.push(`/property/${id}` as never);
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setPage(1);
  }

  function handleSearchChange(query: string) {
    setSearch(query);
    setPage(1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property Management</Text>
        <Text style={styles.subtitle}>Review and manage all property listings.</Text>
      </View>

      <PropertyAdminList
        properties={properties}
        total={total}
        isLoading={isLoading}
        isMutating={approveProperty.isPending || rejectProperty.isPending || deleteProperty.isPending}
        activeStatus={status}
        searchQuery={search}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={setDeleteTarget}
        onView={handleView}
        onLoadMore={() => setPage((p) => p + 1)}
        hasMore={hasMore}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Property"
        message="This will permanently delete this property. This action cannot be undone."
        confirmLabel="Delete"
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
});
