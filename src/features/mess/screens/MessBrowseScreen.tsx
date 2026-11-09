import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { ArrowUpDown, Check, ChevronDown, GraduationCap, Plus, SearchX, SlidersHorizontal } from "@/components/icons";
import { LiveText } from "@/components/LiveText";
import { PageMeta } from "@/components/PageMeta";
import { AppButton } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { startSeatListing } from "@/lib/startListing";
import { useSavedStore } from "@/stores/savedStore";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { ActiveFilterChips } from "../components/ActiveFilterChips";
import { MessFilterSheet } from "../components/MessFilterSheet";
import { MessListingCard } from "../components/MessListingCard";
import { MessSheet } from "../components/MessSheet";
import { UniversityPicker } from "../components/UniversityPicker";
import { CardBreakdownModal } from "../components/UtilityBreakdown";
import { useMessFilters } from "../hooks/useMessFilters";
import { prefetchMessDetail, useMessFeed } from "../hooks/useMessQueries";
import { useSyncSeatPreferences } from "../hooks/useSeatPreferences";
import { campusLabel, findCampus, useUniversities } from "../hooks/useUniversities";
import type { MessCard, MessSort, RuleKey } from "../types/mess";
import { clearedFilters, countActiveFilters } from "../utils/filterParams";
import { ruleMatchesFilters } from "../utils/rules";

const SORTS: { value: MessSort; labelKey: TranslationKey; needsCampus?: boolean }[] = [
  { value: "walk_asc", labelKey: "mess.filters.sortWalk", needsCampus: true },
  { value: "all_in_asc", labelKey: "mess.filters.sortPrice" },
  { value: "newest", labelKey: "mess.filters.sortNewest" },
  { value: "recently_confirmed", labelKey: "mess.filters.sortConfirmed" },
];

type Panel = "filters" | "campus" | "sort" | null;

/** Mess & Seat Share search: pick a campus once, then filter by walk, all-in budget and house rules. */
export function MessBrowseScreen() {
  useSyncSeatPreferences();
  const { t, language } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const queryClient = useQueryClient();
  const { filters, commit } = useMessFilters();
  const universities = useUniversities();
  const feed = useMessFeed(filters);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const [panel, setPanel] = useState<Panel>(null);
  const [breakdownId, setBreakdownId] = useState<string | null>(null);

  const choice = findCampus(universities.data, filters.campus_id);
  const campusName = choice ? campusLabel(choice) : null;
  const filterCount = countActiveFilters(filters);
  const sort = filters.sort_by ?? (filters.campus_id ? "walk_asc" : "recently_confirmed");
  const activeRuleFilters = (key: RuleKey) => ruleMatchesFilters(key, filters);

  // A remembered campus that has left the catalogue would match nothing.
  useEffect(() => {
    if (filters.campus_id && universities.isSuccess && !choice) {
      const { campus_id: _campus, max_walk_min: _walk, ...rest } = filters;
      commit(rest);
    }
  }, [filters, universities.isSuccess, choice, commit]);

  const columns = isPhone ? 1 : isTablet ? 2 : 3;
  const rows: MessCard[][] = [];
  for (let i = 0; i < feed.items.length; i += columns) rows.push(feed.items.slice(i, i + columns));

  const heading = campusName ? t("mess.browse.headingCampus", { campus: campusName }) : t("mess.browse.heading");
  const count = feed.total ?? 0;

  return (
    <AppChrome active="mess">
      <PageMeta title={t("mess.meta.browseTitle")} description={t("mess.meta.browseDescription")} />

      <View style={styles.page}>
        <View style={[styles.header, isPhone && styles.headerPhone]}>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" aria-level={1} style={[styles.h1, isPhone && styles.h1Phone]}>
              {heading}
            </Text>
            <Text style={styles.intro}>{t("mess.browse.intro")}</Text>
          </View>
          <AppButton label={t("mess.browse.listSeat")} icon={Plus} onPress={startSeatListing} variant="secondary" />
        </View>

        <View style={styles.toolbar}>
          <ToolbarButton
            icon={GraduationCap}
            label={campusName ? t("mess.campus.yourCampus", { campus: campusName }) : t("mess.campus.choose")}
            onPress={() => setPanel("campus")}
            emphasis={!campusName}
          />
          <ToolbarButton
            icon={SlidersHorizontal}
            label={filterCount ? t("mess.filters.buttonCount", { count: formatLocalizedNumber(filterCount, language) }) : t("mess.filters.button")}
            onPress={() => setPanel("filters")}
          />
          <ToolbarButton
            icon={ArrowUpDown}
            label={t(SORTS.find((option) => option.value === sort)!.labelKey)}
            accessibilityLabel={`${t("mess.filters.sort")}: ${t(SORTS.find((option) => option.value === sort)!.labelKey)}`}
            onPress={() => setPanel("sort")}
          />
        </View>

        <ActiveFilterChips filters={filters} onChange={commit} />

        {!filters.campus_id ? (
          <View style={styles.prompt}>
            <GraduationCap size={22} color={colorTokens.brandText} />
            <Text style={styles.promptText}>{t("mess.campus.prompt")}</Text>
            <AppButton label={t("mess.campus.choose")} onPress={() => setPanel("campus")} />
          </View>
        ) : null}

        {feed.loading ? (
          <View style={styles.grid}>
            {Array.from({ length: columns }, (_, i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : feed.isError ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>{t("mess.browse.loadFailed")}</Text>
            <AppButton label={t("mess.browse.retry")} onPress={() => feed.refresh()} variant="secondary" />
          </View>
        ) : feed.items.length === 0 ? (
          <View style={styles.state}>
            <SearchX size={36} color={colorTokens.subtle} />
            <Text style={styles.stateTitle}>{filterCount ? t("mess.browse.empty") : t("mess.browse.emptyNoFilters")}</Text>
            <Text style={styles.stateText}>{filterCount ? t("mess.browse.emptyHint") : t("mess.browse.emptyNoFiltersHint")}</Text>
            {filterCount ? <AppButton label={t("mess.filters.clearAll")} onPress={() => commit(clearedFilters(filters))} variant="secondary" /> : null}
          </View>
        ) : (
          <>
            <LiveText style={styles.count} accessibilityLiveRegion="polite">
              {count === 1 ? t("mess.browse.resultsOne") : t("mess.browse.results", { count: formatLocalizedNumber(count, language) })}
            </LiveText>
            <View style={styles.grid} role="list">
              {rows.map((row, r) => (
                <View key={r} style={styles.row}>
                  {row.map((item) => (
                    <View key={item.id} style={styles.cell} role="listitem">
                      <MessListingCard
                        item={item}
                        onPress={(id) => router.push(`/mess/${id}` as never)}
                        onPressIn={(id) => void prefetchMessDetail(queryClient, id)}
                        onPressPrice={setBreakdownId}
                        activeRuleFilters={item.rules.filter(activeRuleFilters)}
                        saved={savedIds.includes(item.id)}
                        onToggleSave={(id) => void toggleSaved(id)}
                      />
                    </View>
                  ))}
                  {Array.from({ length: columns - row.length }, (_, i) => (
                    <View key={`filler-${i}`} style={styles.cell} />
                  ))}
                </View>
              ))}
            </View>
            {feed.hasMore ? (
              <AppButton
                label={t("mess.browse.loadMore")}
                loading={feed.fetchingNextPage}
                onPress={() => void feed.loadMore()}
                variant="secondary"
                style={styles.loadMore}
              />
            ) : null}
          </>
        )}

        <View style={styles.listerBanner}>
          <Text style={styles.listerText}>{t("mess.browse.listSeatHint")}</Text>
          <AppButton label={t("mess.browse.listSeat")} icon={Plus} onPress={startSeatListing} />
        </View>
      </View>

      <MessFilterSheet
        visible={panel === "filters"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={commit}
        campusName={campusName}
        onPickCampus={() => setPanel("campus")}
      />
      <UniversityPicker
        visible={panel === "campus"}
        onClose={() => setPanel(null)}
        selectedCampusId={filters.campus_id}
        onSelect={(campusId) => {
          const next = { ...filters, campus_id: campusId ?? undefined };
          if (!campusId) delete next.max_walk_min;
          commit(next);
        }}
      />
      <MessSheet visible={panel === "sort"} onClose={() => setPanel(null)} title={t("mess.filters.sort")} closeLabel={t("common.close")} width={420}>
        <View role="radiogroup" style={styles.sortList}>
          {SORTS.map((option) => {
            const disabled = option.needsCampus && !filters.campus_id;
            const selected = option.value === sort;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                onPress={() => {
                  commit({ ...filters, sort_by: option.value });
                  setPanel(null);
                }}
                style={[styles.sortRow, selected && styles.sortRowSelected, disabled && styles.sortRowDisabled, webPointer]}
              >
                <Text style={[styles.sortText, selected && styles.sortTextSelected]}>{t(option.labelKey)}</Text>
                {selected ? <Check size={18} color={colorTokens.brandText} /> : null}
              </Pressable>
            );
          })}
        </View>
      </MessSheet>
      {breakdownId ? <CardBreakdownModal id={breakdownId} visible onClose={() => setBreakdownId(null)} /> : null}
    </AppChrome>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onPress,
  emphasis = false,
  accessibilityLabel,
}: {
  icon: typeof GraduationCap;
  label: string;
  onPress: () => void;
  emphasis?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => [styles.toolButton, emphasis && styles.toolButtonEmphasis, hovered && styles.toolButtonHovered, webPointer]}
    >
      <Icon size={16} color={emphasis ? colorTokens.brandText : colorTokens.ink} />
      <Text style={[styles.toolText, emphasis && styles.toolTextEmphasis]} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDown size={14} color={colorTokens.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", paddingTop: 16, paddingBottom: 40, gap: 16 },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16 },
  headerPhone: { flexDirection: "column", alignItems: "flex-start" },
  headerText: { flex: 1, gap: 6, maxWidth: 720 },
  h1: { fontFamily: fonts.headingExtraBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.5, color: colorTokens.ink },
  h1Phone: { fontSize: 23, lineHeight: 30 },
  intro: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colorTokens.muted },
  toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    maxWidth: "100%",
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  toolButtonEmphasis: { borderColor: colorTokens.brandBorder, backgroundColor: colorTokens.brandSurface },
  toolButtonHovered: { backgroundColor: colorTokens.surfaceSunken },
  toolText: { flexShrink: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  toolTextEmphasis: { color: colorTokens.brandText },
  prompt: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colorTokens.brandSurface,
  },
  promptText: { flex: 1, minWidth: 200, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colorTokens.ink },
  count: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.body },
  grid: { gap: 16 },
  row: { flexDirection: "row", gap: 16 },
  cell: { flex: 1, minWidth: 0 },
  skeleton: { height: 360, borderRadius: radius.card, backgroundColor: colorTokens.surfaceSunken },
  state: { alignItems: "center", gap: 10, paddingVertical: 48, paddingHorizontal: 16 },
  stateTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colorTokens.ink, textAlign: "center" },
  stateText: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted, textAlign: "center", marginBottom: 6 },
  loadMore: { alignSelf: "center", minWidth: 200 },
  listerBanner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  listerText: { flex: 1, minWidth: 200, fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  sortList: { gap: 4 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  sortRowSelected: { backgroundColor: colorTokens.brandSurface },
  sortRowDisabled: { opacity: 0.45 },
  sortText: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.ink },
  sortTextSelected: { fontFamily: fonts.semiBold, color: colorTokens.brandText },
});
