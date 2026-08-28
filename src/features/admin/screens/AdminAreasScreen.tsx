import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MapPinned, Pencil, Plus, Trash2, X } from "lucide-react-native";
import { AreaPicker } from "@/components/AreaPicker";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  createArea,
  deleteArea,
  fetchArea,
  fetchAreaChildren,
  fetchAreas,
  updateArea,
} from "@/services/areaApi";
import { toApiError } from "@/services/apiClient";
import type { Area, AreaDetail, CreateAreaDto } from "@/types/api";
import { colorTokens, fontTokens, webPointer } from "@/theme";

interface AreaFormProps {
  visible: boolean;
  initial: AreaDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (dto: CreateAreaDto) => void;
}

function areaErrorMessage(error: unknown) {
  const apiError = toApiError(error);
  if (apiError.errorCode === 1402) return "This area cannot be deleted while it has active listings.";
  if (apiError.status === 409) return apiError.message || "An area with this name already exists.";
  if (apiError.status === 403) return apiError.message || "You do not have permission to manage areas.";
  if (apiError.status === 404) return apiError.message || "The requested area no longer exists.";
  return apiError.message;
}

function AreaForm({ visible, initial, loading, error, onClose, onSubmit }: AreaFormProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [boundary, setBoundary] = useState("");
  const [centroid, setCentroid] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [parent, setParent] = useState<Area | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? "");
    setCity(initial?.city ?? "Dhaka");
    setBoundary(initial?.boundary ?? "");
    setCentroid(initial?.centroid ?? "");
    setAdvanced(Boolean(initial?.boundary || initial?.centroid));
    setParent(
      initial?.parent
        ? {
            ...initial.parent,
            parent_area_id: null,
            city: initial.city,
          }
        : null,
    );
  }, [initial, visible]);

  function submit() {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      city: city.trim() || "Dhaka",
      parent_area_id: parent?.id ?? null,
      boundary: boundary.trim() || undefined,
      centroid: centroid.trim() || undefined,
    });
  }

  return (
    <>
      <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.formDialog}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{initial ? "Edit Area" : "Create Area"}</Text>
              <Pressable onPress={onClose} style={styles.iconButton} accessibilityLabel="Close area form">
                <X color={colorTokens.textSecondary} size={18} />
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Area name"
              placeholderTextColor={colorTokens.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Dhaka"
              placeholderTextColor={colorTokens.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Parent area</Text>
            <Pressable onPress={() => setPickerOpen(true)} style={styles.parentButton}>
              <MapPinned color={colorTokens.primary} size={16} />
              <Text style={styles.parentText}>{parent?.name ?? "No parent"}</Text>
            </Pressable>
            {parent ? (
              <Pressable onPress={() => setParent(null)} style={styles.clearParentButton}>
                <Text style={styles.advancedText}>Remove parent</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={() => setAdvanced((value) => !value)} style={styles.advancedButton}>
              <Text style={styles.advancedText}>{advanced ? "Hide advanced fields" : "Show advanced fields"}</Text>
            </Pressable>

            {advanced ? (
              <View style={styles.advancedFields}>
                <Text style={styles.label}>Boundary</Text>
                <TextInput
                  value={boundary}
                  onChangeText={setBoundary}
                  multiline
                  placeholder="GeoJSON boundary"
                  placeholderTextColor={colorTokens.textMuted}
                  style={[styles.input, styles.multiline]}
                />
                <Text style={styles.label}>Centroid</Text>
                <TextInput
                  value={centroid}
                  onChangeText={setCentroid}
                  placeholder="GeoJSON centroid"
                  placeholderTextColor={colorTokens.textMuted}
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.formActions}>
              <Pressable onPress={onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={loading || !name.trim() || parent?.id === initial?.id}
                style={[styles.primaryButton, (loading || !name.trim()) && styles.disabled]}
              >
                {loading ? (
                  <ActivityIndicator color={colorTokens.textInverse} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>{initial ? "Save" : "Create"}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <AreaPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedArea={parent}
        initialCity={city || undefined}
        onSelect={(area) => setParent(area?.id === initial?.id ? null : area)}
      />
    </>
  );
}

export function AdminAreasScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [path, setPath] = useState<Area[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AreaDetail | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const parentId = path.at(-1)?.id;

  const areasQuery = useQuery({
    queryKey: ["areas", "admin", search, page, parentId],
    queryFn: async () => {
      if (parentId && !search.trim()) {
        const response = await fetchAreaChildren(parentId);
        return { items: response.data ?? [], total: response.data?.length ?? 0, total_pages: 1 };
      }
      const response = await fetchAreas({ search: search.trim() || undefined, page, limit: 20 });
      return response.data ?? { items: [], total: 0, total_pages: 0 };
    },
  });

  const saveMutation = useMutation({
    mutationFn: (dto: CreateAreaDto) =>
      editing ? updateArea(editing.id, dto) : createArea(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      setFormOpen(false);
      setEditing(null);
      setFormError(null);
    },
    onError: (error) => setFormError(areaErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      setDeleteTarget(null);
    },
    onError: (error) => {
      setDeleteTarget(null);
      setFormError(areaErrorMessage(error));
    },
  });

  async function openEdit(area: Area) {
    setFormError(null);
    setDetailLoadingId(area.id);
    try {
      const response = await fetchArea(area.id);
      if (!response.data) throw new Error("Area not found");
      setEditing(response.data);
      setFormOpen(true);
    } catch (error) {
      setFormError(areaErrorMessage(error));
    } finally {
      setDetailLoadingId(null);
    }
  }

  const data = areasQuery.data?.items ?? [];
  const totalPages = areasQuery.data?.total_pages ?? 1;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.title}>Area Management</Text>
          <Text style={styles.subtitle}>Manage location hierarchy used by property listings.</Text>
        </View>
        <Pressable
          onPress={() => {
            setEditing(null);
            setFormError(null);
            setFormOpen(true);
          }}
          style={[styles.addButton, webPointer]}
        >
          <Plus color={colorTokens.textInverse} size={16} />
          <Text style={styles.addButtonText}>Add Area</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search areas"
          placeholderTextColor={colorTokens.textMuted}
          style={styles.searchInput}
        />
      </View>

      {path.length > 0 && !search ? (
        <Pressable onPress={() => setPath((items) => items.slice(0, -1))} style={styles.backButton}>
          <ChevronLeft color={colorTokens.primary} size={16} />
          <Text style={styles.backText}>{path.map((area) => area.name).join(" / ")}</Text>
        </Pressable>
      ) : null}

      {formError && !formOpen ? <Text style={styles.errorText}>{formError}</Text> : null}

      {areasQuery.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colorTokens.primary} size="large" /></View>
      ) : areasQuery.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{areaErrorMessage(areasQuery.error)}</Text>
          <Pressable onPress={() => areasQuery.refetch()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No areas found</Text></View>}
          renderItem={({ item }) => (
            <View style={styles.areaRow}>
              <Pressable
                onPress={() => item._count?.children && setPath((items) => [...items, item])}
                style={styles.areaInfo}
              >
                <MapPinned color={colorTokens.primary} size={18} />
                <View style={styles.areaCopy}>
                  <Text style={styles.areaName}>{item.name}</Text>
                  <Text style={styles.areaMeta}>{item.city || "No city"} · {item._count?.children ?? 0} children</Text>
                </View>
                {item._count?.children ? <ChevronRight color={colorTokens.textMuted} size={16} /> : null}
              </Pressable>
              <Pressable disabled={detailLoadingId === item.id} onPress={() => void openEdit(item)} style={styles.iconButton} accessibilityLabel={`Edit ${item.name}`}>
                {detailLoadingId === item.id ? (
                  <ActivityIndicator color={colorTokens.primary} size="small" />
                ) : (
                  <Pencil color={colorTokens.primary} size={15} />
                )}
              </Pressable>
              <Pressable onPress={() => setDeleteTarget(item)} style={styles.iconButton} accessibilityLabel={`Delete ${item.name}`}>
                <Trash2 color={colorTokens.error} size={15} />
              </Pressable>
            </View>
          )}
        />
      )}

      {totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable disabled={page === 1} onPress={() => setPage((value) => value - 1)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>
          <Text style={styles.pageText}>{page} / {totalPages}</Text>
          <Pressable disabled={page >= totalPages} onPress={() => setPage((value) => value + 1)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Next</Text>
          </Pressable>
        </View>
      ) : null}

      <AreaForm
        visible={formOpen}
        initial={editing}
        loading={saveMutation.isPending}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(dto) => saveMutation.mutate(dto)}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Area"
        message={`Delete ${deleteTarget?.name ?? "this area"}? Areas with active listings cannot be deleted.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 22, fontFamily: fontTokens.extraBold, color: colorTokens.textPrimary },
  subtitle: { fontSize: 13, fontFamily: fontTokens.regular, color: colorTokens.textSecondary, marginTop: 4 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, backgroundColor: colorTokens.primary, paddingHorizontal: 14, paddingVertical: 10 },
  addButtonText: { color: colorTokens.textInverse, fontFamily: fontTokens.bold, fontSize: 13 },
  searchRow: { borderRadius: 12, borderWidth: 1, borderColor: colorTokens.divider, backgroundColor: colorTokens.backgroundAlt, paddingHorizontal: 12 },
  searchInput: { minHeight: 42, color: colorTokens.textPrimary, fontFamily: fontTokens.regular },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: colorTokens.primary, fontFamily: fontTokens.semiBold, fontSize: 12 },
  list: { paddingBottom: 8 },
  separator: { height: 8 },
  areaRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderColor: colorTokens.divider, backgroundColor: colorTokens.background, padding: 12 },
  areaInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  areaCopy: { flex: 1, gap: 2 },
  areaName: { color: colorTokens.textPrimary, fontFamily: fontTokens.bold, fontSize: 14 },
  areaMeta: { color: colorTokens.textMuted, fontFamily: fontTokens.regular, fontSize: 11 },
  iconButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colorTokens.backgroundAlt },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 40 },
  emptyText: { color: colorTokens.textMuted, fontFamily: fontTokens.semiBold },
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12 },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  pageText: { color: colorTokens.textSecondary, fontFamily: fontTokens.semiBold },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colorTokens.overlay },
  formDialog: { width: "100%", maxWidth: 520, maxHeight: "90%", borderRadius: 18, backgroundColor: colorTokens.background, padding: 20, gap: 8 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  formTitle: { fontSize: 18, fontFamily: fontTokens.bold, color: colorTokens.textPrimary },
  label: { fontSize: 12, fontFamily: fontTokens.semiBold, color: colorTokens.textSecondary, marginTop: 4 },
  input: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: colorTokens.divider, paddingHorizontal: 12, color: colorTokens.textPrimary, fontFamily: fontTokens.regular },
  multiline: { minHeight: 74, paddingTop: 10, textAlignVertical: "top" },
  parentButton: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, borderColor: colorTokens.divider, paddingHorizontal: 12 },
  parentText: { color: colorTokens.textPrimary, fontFamily: fontTokens.regular },
  clearParentButton: { alignSelf: "flex-start", paddingVertical: 4 },
  advancedButton: { paddingVertical: 8 },
  advancedText: { color: colorTokens.primary, fontFamily: fontTokens.semiBold, fontSize: 12 },
  advancedFields: { gap: 8 },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 10 },
  primaryButton: { minWidth: 90, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colorTokens.primary, paddingHorizontal: 14 },
  primaryButtonText: { color: colorTokens.textInverse, fontFamily: fontTokens.bold, fontSize: 13 },
  secondaryButton: { minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colorTokens.divider, paddingHorizontal: 14 },
  secondaryButtonText: { color: colorTokens.textSecondary, fontFamily: fontTokens.semiBold, fontSize: 12 },
  disabled: { opacity: 0.5 },
});
