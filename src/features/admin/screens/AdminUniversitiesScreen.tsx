import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { GraduationCap, MapPinned, Pencil, Plus, Trash2, X } from "@/components/icons";
import { DHAKA_CENTER, type MapPoint } from "@/features/property/constants/areaCenters";
import { LocationPicker } from "@/features/property/components/wizard/LocationPicker";
import { searchUniversities } from "@/features/mess/hooks/useUniversities";
import { useAdminUniversities, useUniversityAdminMutations } from "@/features/mess/hooks/useUniversityAdmin";
import type { Campus, CampusInput, University, UniversityInput } from "@/features/mess/types/mess";
import { useTranslation, type TranslationKey } from "@/i18n";
import { parseCoordinate } from "@/lib/coordinates";
import { toApiError } from "@/services/apiClient";
import { colorTokens, fontTokens, webPointer } from "@/theme";
import { ConfirmDialog } from "../components/ConfirmDialog";

/**
 * The university and campus catalogue behind Mess & Seat Share (PRD 2.2.5 and
 * 2.3, manage_areas). Students pick a campus; walking times are measured from
 * each listing to the campus gate, and the API recomputes them for nearby
 * listings whenever a campus is added or its pin moves.
 */

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

function catalogueErrorMessage(error: unknown, t: Translate) {
  const apiError = toApiError(error);
  if (apiError.status === 409) return t("admin.universities.shortNameTaken");
  if (apiError.status === 403) return t("admin.universities.permissionDenied");
  if (apiError.status === 404) return t("admin.universities.notFound");
  return apiError.message;
}

// ─── Forms ───────────────────────────────────────────────────────────────────

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={value}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={[styles.toggleRow, webPointer]}
    >
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
      <Text style={styles.toggleText}>{label}</Text>
    </Pressable>
  );
}

function FormShell({
  visible,
  title,
  error,
  loading,
  canSubmit,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: {
  visible: boolean;
  title: string;
  error: string | null;
  loading: boolean;
  canSubmit: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.formDialog}>
          <View style={styles.formHeader}>
            <Text accessibilityRole="header" style={styles.formTitle}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={[styles.iconButton, webPointer]} accessibilityLabel={t("admin.universities.closeFormAria")}>
              <X color={colorTokens.textSecondary} size={18} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
            {error ? (
              <Text role="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
            {children}
          </ScrollView>
          <View style={styles.formActions}>
            <Pressable onPress={onClose} style={[styles.secondaryButton, webPointer]}>
              <Text style={styles.secondaryButtonText}>{t("common.cancel")}</Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              disabled={loading || !canSubmit}
              style={[styles.primaryButton, webPointer, (loading || !canSubmit) && styles.disabled]}
            >
              {loading ? <ActivityIndicator color={colorTokens.onBrand} size="small" /> : <Text style={styles.primaryButtonText}>{submitLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function UniversityForm({
  visible,
  initial,
  loading,
  error,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: University | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: UniversityInput) => void;
}) {
  const { t } = useTranslation();
  // The screen remounts the form (a new key) each time it opens, so these start from `initial`.
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.short_name ?? "");
  const [city, setCity] = useState(initial?.city ?? "Dhaka");
  const [active, setActive] = useState(initial?.is_active ?? true);

  const canSubmit = Boolean(name.trim() && shortName.trim());

  return (
    <FormShell
      visible={visible}
      title={initial ? t("admin.universities.editTitle") : t("admin.universities.createTitle")}
      error={error}
      loading={loading}
      canSubmit={canSubmit}
      submitLabel={initial ? t("common.save") : t("admin.universities.add")}
      onClose={onClose}
      onSubmit={() => canSubmit && onSubmit({ name: name.trim(), short_name: shortName.trim(), city: city.trim() || "Dhaka", is_active: active })}
    >
      <Text style={styles.label}>{t("admin.universities.nameLabel")}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        accessibilityLabel={t("admin.universities.nameLabel")}
        placeholder={t("admin.universities.namePlaceholder")}
        placeholderTextColor={colorTokens.textMuted}
        style={styles.input}
      />
      <Text style={styles.label}>{t("admin.universities.shortLabel")}</Text>
      <TextInput
        value={shortName}
        onChangeText={setShortName}
        accessibilityLabel={t("admin.universities.shortLabel")}
        autoCapitalize="characters"
        placeholder={t("admin.universities.shortPlaceholder")}
        placeholderTextColor={colorTokens.textMuted}
        style={styles.input}
      />
      <Text style={styles.help}>{t("admin.universities.shortHelp")}</Text>
      <Text style={styles.label}>{t("admin.universities.cityLabel")}</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        accessibilityLabel={t("admin.universities.cityLabel")}
        placeholderTextColor={colorTokens.textMuted}
        style={styles.input}
      />
      <Toggle label={t("admin.universities.activeLabel")} value={active} onChange={setActive} />
    </FormShell>
  );
}

const formatCoordinate = (value: number) => String(Math.round(value * 1e6) / 1e6);

function CampusForm({
  visible,
  university,
  initial,
  loading,
  error,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  university: University | null;
  initial: Campus | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: CampusInput) => void;
}) {
  const { t } = useTranslation();
  // Remounted on each open (see UniversityForm). A university's first campus is its main one.
  const [name, setName] = useState(initial?.name ?? "");
  const [primary, setPrimary] = useState(initial?.is_primary ?? (university?.campuses.length ?? 0) === 0);
  const [lat, setLat] = useState(initial ? formatCoordinate(initial.lat) : "");
  const [lng, setLng] = useState(initial ? formatCoordinate(initial.lng) : "");

  const latValue = parseCoordinate(lat, 90);
  const lngValue = parseCoordinate(lng, 180);
  const pin: MapPoint | null = latValue !== null && lngValue !== null ? { lat: latValue, lng: lngValue } : null;
  const showCoordinateError = !pin && (lat !== "" || lng !== "");
  const canSubmit = Boolean(name.trim() && pin && university);

  const movePin = (next: MapPoint | null) => {
    setLat(next ? formatCoordinate(next.lat) : "");
    setLng(next ? formatCoordinate(next.lng) : "");
  };

  return (
    <FormShell
      visible={visible}
      title={initial ? t("admin.universities.campusEditTitle") : t("admin.universities.campusCreateTitle", { name: university?.short_name ?? "" })}
      error={error}
      loading={loading}
      canSubmit={canSubmit}
      submitLabel={initial ? t("common.save") : t("admin.universities.addCampus")}
      onClose={onClose}
      onSubmit={() => {
        if (!canSubmit || !pin || !university) return;
        onSubmit({ university_id: university.id, name: name.trim(), lat: pin.lat, lng: pin.lng, is_primary: primary });
      }}
    >
      <Text style={styles.label}>{t("admin.universities.campusNameLabel")}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        accessibilityLabel={t("admin.universities.campusNameLabel")}
        placeholder={t("admin.universities.campusNamePlaceholder")}
        placeholderTextColor={colorTokens.textMuted}
        style={styles.input}
      />
      <Toggle label={t("admin.universities.primaryLabel")} value={primary} onChange={setPrimary} />
      <Text style={styles.help}>{t("admin.universities.pinHelp")}</Text>
      <View style={styles.mapBox}>
        <LocationPicker value={pin} openAt={pin ?? DHAKA_CENTER} onChange={movePin} />
      </View>
      <View style={styles.coordinateRow}>
        <View style={styles.coordinateField}>
          <Text style={styles.label}>{t("admin.universities.latLabel")}</Text>
          <TextInput
            value={lat}
            onChangeText={setLat}
            accessibilityLabel={t("admin.universities.latLabel")}
            keyboardType="numbers-and-punctuation"
            placeholder="23.7977"
            placeholderTextColor={colorTokens.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.coordinateField}>
          <Text style={styles.label}>{t("admin.universities.lngLabel")}</Text>
          <TextInput
            value={lng}
            onChangeText={setLng}
            accessibilityLabel={t("admin.universities.lngLabel")}
            keyboardType="numbers-and-punctuation"
            placeholder="90.4497"
            placeholderTextColor={colorTokens.textMuted}
            style={styles.input}
          />
        </View>
      </View>
      {showCoordinateError ? <Text style={styles.errorText}>{t("admin.universities.coordinatesInvalid")}</Text> : null}
    </FormShell>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

type DeleteTarget = { kind: "university"; item: University } | { kind: "campus"; item: Campus };

export function AdminUniversitiesScreen() {
  const { t } = useTranslation();
  const query = useAdminUniversities();
  const { saveUniversity, removeUniversity, saveCampus, removeCampus } = useUniversityAdminMutations();
  const [search, setSearch] = useState("");
  const [universityForm, setUniversityForm] = useState<{ open: boolean; editing: University | null }>({ open: false, editing: null });
  const [campusForm, setCampusForm] = useState<{ open: boolean; university: University | null; editing: Campus | null }>({
    open: false,
    university: null,
    editing: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  /** Bumped on every open, so each form starts fresh from what it edits. */
  const [formKey, setFormKey] = useState(0);

  const universities = useMemo(() => {
    const all = query.data ?? [];
    return searchUniversities(all, search).sort((a, b) => a.short_name.localeCompare(b.short_name));
  }, [query.data, search]);

  const openUniversity = (editing: University | null) => {
    setFormError(null);
    setFormKey((key) => key + 1);
    setUniversityForm({ open: true, editing });
  };
  const openCampus = (university: University, editing: Campus | null) => {
    setFormError(null);
    setFormKey((key) => key + 1);
    setCampusForm({ open: true, university, editing });
  };
  const closeForms = () => {
    setUniversityForm((form) => ({ ...form, open: false }));
    setCampusForm((form) => ({ ...form, open: false }));
  };

  const submitUniversity = (input: UniversityInput) =>
    saveUniversity.mutate(
      { id: universityForm.editing?.id, input },
      { onSuccess: closeForms, onError: (error) => setFormError(catalogueErrorMessage(error, t)) },
    );
  const submitCampus = (input: CampusInput) =>
    saveCampus.mutate(
      { id: campusForm.editing?.id, input },
      { onSuccess: closeForms, onError: (error) => setFormError(catalogueErrorMessage(error, t)) },
    );
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const done = {
      onSuccess: () => setDeleteTarget(null),
      onError: (error: unknown) => {
        setDeleteTarget(null);
        setListError(catalogueErrorMessage(error, t));
      },
    };
    setListError(null);
    if (deleteTarget.kind === "university") removeUniversity.mutate(deleteTarget.item.id, done);
    else removeCampus.mutate(deleteTarget.item.id, done);
  };

  const campusCount = (count: number) =>
    count === 1 ? t("admin.universities.campusOne") : t("admin.universities.campusCount", { count });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" aria-level={2} style={styles.title}>
            {t("admin.universities.title")}
          </Text>
          <Text style={styles.subtitle}>{t("admin.universities.subtitle")}</Text>
        </View>
        <Pressable onPress={() => openUniversity(null)} style={[styles.addButton, webPointer]}>
          <Plus color={colorTokens.onBrand} size={16} />
          <Text style={styles.addButtonText}>{t("admin.universities.add")}</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t("admin.universities.searchPlaceholder")}
          placeholder={t("admin.universities.searchPlaceholder")}
          placeholderTextColor={colorTokens.textMuted}
          style={styles.searchInput}
        />
      </View>

      {listError ? (
        <Text role="alert" style={styles.errorText}>
          {listError}
        </Text>
      ) : null}

      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{catalogueErrorMessage(query.error, t) || t("admin.universities.loadFailed")}</Text>
          <Pressable onPress={() => void query.refetch()} style={[styles.secondaryButton, webPointer]}>
            <Text style={styles.secondaryButtonText}>{t("admin.roles.retry")}</Text>
          </Pressable>
        </View>
      ) : universities.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{search ? t("admin.universities.noMatch") : t("admin.universities.empty")}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {universities.map((university) => (
            <View key={university.id} style={styles.card}>
              <View style={styles.cardHead}>
                <GraduationCap color={colorTokens.brandText} size={18} />
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>
                    {university.short_name}
                    <Text style={styles.cardName}>{`  ${university.name}`}</Text>
                  </Text>
                  <Text style={styles.meta}>
                    {university.city} · {campusCount(university.campuses.length)}
                    {university.is_active === false ? ` · ${t("admin.universities.hidden")}` : ""}
                  </Text>
                </View>
                <Pressable
                  onPress={() => openUniversity(university)}
                  style={[styles.iconButton, webPointer]}
                  accessibilityLabel={t("admin.universities.editAria", { name: university.short_name })}
                >
                  <Pencil color={colorTokens.brandText} size={15} />
                </Pressable>
                <Pressable
                  onPress={() => setDeleteTarget({ kind: "university", item: university })}
                  style={[styles.iconButton, webPointer]}
                  accessibilityLabel={t("admin.universities.deleteAria", { name: university.short_name })}
                >
                  <Trash2 color={colorTokens.error} size={15} />
                </Pressable>
              </View>

              {university.campuses.length === 0 ? <Text style={styles.warning}>{t("admin.universities.noCampuses")}</Text> : null}
              {university.campuses.map((campus) => (
                <View key={campus.id} style={styles.campusRow}>
                  <MapPinned color={colorTokens.textMuted} size={15} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.campusName}>
                      {campus.name}
                      {campus.is_primary ? <Text style={styles.primaryTag}>{`  ${t("admin.universities.primary")}`}</Text> : null}
                    </Text>
                    <Text style={styles.meta}>
                      {formatCoordinate(campus.lat)}, {formatCoordinate(campus.lng)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => openCampus(university, campus)}
                    style={[styles.iconButton, webPointer]}
                    accessibilityLabel={t("admin.universities.editAria", { name: campus.name })}
                  >
                    <Pencil color={colorTokens.brandText} size={15} />
                  </Pressable>
                  <Pressable
                    onPress={() => setDeleteTarget({ kind: "campus", item: campus })}
                    style={[styles.iconButton, webPointer]}
                    accessibilityLabel={t("admin.universities.deleteAria", { name: campus.name })}
                  >
                    <Trash2 color={colorTokens.error} size={15} />
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={() => openCampus(university, null)} style={[styles.addCampus, webPointer]}>
                <Plus color={colorTokens.brandText} size={14} />
                <Text style={styles.addCampusText}>{t("admin.universities.addCampus")}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <UniversityForm
        key={`university-${formKey}`}
        visible={universityForm.open}
        initial={universityForm.editing}
        loading={saveUniversity.isPending}
        error={universityForm.open ? formError : null}
        onClose={closeForms}
        onSubmit={submitUniversity}
      />
      <CampusForm
        key={`campus-${formKey}`}
        visible={campusForm.open}
        university={campusForm.university}
        initial={campusForm.editing}
        loading={saveCampus.isPending}
        error={campusForm.open ? formError : null}
        onClose={closeForms}
        onSubmit={submitCampus}
      />
      <ConfirmDialog
        visible={!!deleteTarget}
        title={deleteTarget?.kind === "campus" ? t("admin.universities.deleteCampusTitle") : t("admin.universities.deleteUniversityTitle")}
        message={
          deleteTarget?.kind === "campus"
            ? t("admin.universities.deleteCampusMessage", { name: deleteTarget.item.name })
            : t("admin.universities.deleteUniversityMessage", { name: deleteTarget?.item.short_name ?? "" })
        }
        confirmLabel={t("admin.actions.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        loading={removeUniversity.isPending || removeCampus.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  sectionHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  headerCopy: { flex: 1, minWidth: 220, gap: 4 },
  title: { fontSize: 22, fontFamily: fontTokens.extraBold, color: colorTokens.textPrimary },
  subtitle: { fontSize: 13, lineHeight: 19, fontFamily: fontTokens.regular, color: colorTokens.textSecondary },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, backgroundColor: colorTokens.primary, paddingHorizontal: 14, minHeight: 44 },
  addButtonText: { color: colorTokens.onBrand, fontFamily: fontTokens.bold, fontSize: 13 },
  searchRow: { borderRadius: 12, borderWidth: 1, borderColor: colorTokens.divider, backgroundColor: colorTokens.backgroundAlt, paddingHorizontal: 12 },
  searchInput: { minHeight: 44, color: colorTokens.textPrimary, fontFamily: fontTokens.regular },
  list: { gap: 10 },
  card: { gap: 8, borderRadius: 12, borderWidth: 1, borderColor: colorTokens.divider, backgroundColor: colorTokens.background, padding: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardCopy: { flex: 1, gap: 2, minWidth: 0 },
  cardTitle: { color: colorTokens.textPrimary, fontFamily: fontTokens.bold, fontSize: 15 },
  cardName: { color: colorTokens.textSecondary, fontFamily: fontTokens.regular, fontSize: 13 },
  meta: { color: colorTokens.textMuted, fontFamily: fontTokens.regular, fontSize: 12 },
  warning: { color: colorTokens.warningText, fontFamily: fontTokens.regular, fontSize: 12 },
  campusRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 26 },
  campusName: { color: colorTokens.textPrimary, fontFamily: fontTokens.semiBold, fontSize: 13 },
  primaryTag: { color: colorTokens.brandText, fontFamily: fontTokens.semiBold, fontSize: 11 },
  addCampus: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginLeft: 26, minHeight: 36 },
  addCampusText: { color: colorTokens.brandText, fontFamily: fontTokens.semiBold, fontSize: 12 },
  iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colorTokens.backgroundAlt },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 40 },
  emptyText: { color: colorTokens.textMuted, fontFamily: fontTokens.semiBold },
  errorText: { color: colorTokens.error, fontFamily: fontTokens.regular, fontSize: 12 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: colorTokens.overlay },
  formDialog: { width: "100%", maxWidth: 560, maxHeight: "92%", borderRadius: 18, backgroundColor: colorTokens.background, paddingVertical: 20, gap: 8 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 20 },
  formTitle: { flex: 1, fontSize: 18, fontFamily: fontTokens.bold, color: colorTokens.textPrimary },
  formBody: { gap: 8, paddingBottom: 4, paddingHorizontal: 20 },
  label: { fontSize: 12, fontFamily: fontTokens.semiBold, color: colorTokens.textSecondary, marginTop: 4 },
  help: { fontSize: 12, lineHeight: 17, fontFamily: fontTokens.regular, color: colorTokens.textMuted },
  input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colorTokens.divider, paddingHorizontal: 12, color: colorTokens.textPrimary, fontFamily: fontTokens.regular },
  mapBox: { borderRadius: 12, overflow: "hidden" },
  coordinateRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  coordinateField: { flex: 1, minWidth: 140 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
  toggleTrack: { width: 40, height: 24, borderRadius: 12, padding: 2, backgroundColor: colorTokens.divider },
  toggleTrackOn: { backgroundColor: colorTokens.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colorTokens.background },
  toggleThumbOn: { transform: [{ translateX: 16 }] },
  toggleText: { color: colorTokens.textPrimary, fontFamily: fontTokens.regular, fontSize: 14 },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6, paddingHorizontal: 20 },
  primaryButton: { minWidth: 90, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colorTokens.primary, paddingHorizontal: 14 },
  primaryButtonText: { color: colorTokens.onBrand, fontFamily: fontTokens.bold, fontSize: 13 },
  secondaryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colorTokens.divider, paddingHorizontal: 14 },
  secondaryButtonText: { color: colorTokens.textSecondary, fontFamily: fontTokens.semiBold, fontSize: 12 },
  disabled: { opacity: 0.5 },
});
