import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Bell, Building2, Search, X } from "@/components/icons";
import { colorTokens, fontTokens, radius, webPointer } from "@/theme";
import { PropertyAdminItemRow } from "./PropertyAdminItem";
import type { PropertyAdminItem } from "../types/admin";
import { LiveText } from "@/components/LiveText";
import { useTranslation, translateListingStatus, formatLocalizedNumber } from "@/i18n";

export const ADMIN_STATUS_FILTERS = ["all", "draft", "pending", "active", "sold", "archived", "rejected"] as const;

type PressState = { pressed: boolean; hovered?: boolean };

export interface PropertyAdminListProps {
  properties: PropertyAdminItem[];
  total: number;
  isLoading: boolean;
  isMutating: boolean;
  activeStatus: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  messOnly?: boolean;
  onMessOnlyChange?: (messOnly: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onRequestChanges?: (property: PropertyAdminItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  highlightId?: string | null;
  onClearHighlight?: () => void;
}

export function PropertyAdminList({
  properties,
  total,
  isLoading,
  isMutating,
  activeStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
  messOnly = false,
  onMessOnlyChange,
  onApprove,
  onReject,
  onDelete,
  onView,
  onRequestChanges,
  onLoadMore,
  hasMore = false,
  highlightId,
  onClearHighlight,
}: PropertyAdminListProps) {
  const { t, language } = useTranslation();

  // A listing opened from a notification comes first, so it is seen without scrolling.
  // When it is not in this list (another page, or another status) the banner says so
  // instead of claiming a listing is being reviewed.
  const highlighted = highlightId ? properties.find((property) => property.id === highlightId) : undefined;
  const rows = highlighted ? [highlighted, ...properties.filter((property) => property !== highlighted)] : properties;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {ADMIN_STATUS_FILTERS.map((status) => {
          const label =
            status === "all"
              ? t("admin.filters.all")
              : language === "bn"
              ? translateListingStatus(status, language)
              : status.charAt(0).toUpperCase() + status.slice(1);
          const isActive = activeStatus === status;
          return (
            <Pressable
              key={status}
              onPress={() => onStatusChange(status)}
              style={({ pressed, hovered }: PressState) => [
                styles.filterChip,
                isActive && styles.filterChipActive,
                hovered && !isActive && styles.filterChipHovered,
                pressed && styles.filterChipPressed,
                webPointer,
              ]}
              accessibilityLabel={t("admin.filters.filterByAria", { status: label })}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
        {onMessOnlyChange ? (
          <Pressable
            onPress={() => onMessOnlyChange(!messOnly)}
            style={({ pressed, hovered }: PressState) => [
              styles.filterChip,
              messOnly && styles.filterChipActive,
              hovered && !messOnly && styles.filterChipHovered,
              pressed && styles.filterChipPressed,
              webPointer,
            ]}
            accessibilityRole="switch"
            aria-checked={messOnly}
            accessibilityLabel={t("mess.nav")}
          >
            <Text style={[styles.filterText, messOnly && styles.filterTextActive]}>
              {t("mess.nav")}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchRow}>
        <Search color={colorTokens.textMuted} size={16} strokeWidth={2} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={t("admin.searchPropertiesPlaceholder")}
          placeholderTextColor={colorTokens.textMuted}
          style={styles.searchInput}
          accessibilityLabel={t("admin.searchPropertiesPlaceholder")}
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => onSearchChange("")}
            style={styles.clearSearchBtn}
            accessibilityRole="button"
            accessibilityLabel={t("admin.clearSearch")}
          >
            <X color={colorTokens.textMuted} size={14} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      {highlightId ? (
        <View style={styles.highlightBanner}>
          <View style={styles.highlightBannerLeft}>
            <Bell color={colorTokens.brand} size={16} strokeWidth={2.2} />
            <Text style={styles.highlightBannerText}>
              {t(highlighted ? "admin.reviewingFromNotification" : "admin.highlightNotInList")}
            </Text>
          </View>
          {onClearHighlight ? (
            <Pressable
              onPress={onClearHighlight}
              style={({ pressed, hovered }: PressState) => [
                styles.clearHighlightBtn,
                hovered && styles.clearHighlightBtnHovered,
                pressed && styles.clearHighlightBtnPressed,
                webPointer,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("admin.clearFilter")}
            >
              <X color={colorTokens.textSecondary} size={13} strokeWidth={2} />
              <Text style={styles.clearHighlightBtnText}>{t("admin.clearFilter")}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.countRow}>
        <LiveText style={styles.countText}>
          {t("admin.showingCount", {
            count: formatLocalizedNumber(properties.length, language),
            total: formatLocalizedNumber(total, language),
          })}
        </LiveText>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colorTokens.primary} size="large" />
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Building2 color={colorTokens.textMuted} size={36} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeStatus === "all" && !searchQuery
              ? t("admin.noPropertiesFound")
              : t("admin.emptyFilterTitle")}
          </Text>
          <Text style={styles.emptySubtitle}>{t("admin.emptyFilterSubtitle")}</Text>
          {activeStatus !== "all" || searchQuery ? (
            <Pressable
              onPress={() => {
                onStatusChange("all");
                onSearchChange("");
                onClearHighlight?.();
              }}
              style={({ pressed, hovered }: PressState) => [
                styles.resetBtn,
                hovered && styles.resetBtnHovered,
                pressed && styles.resetBtnPressed,
                webPointer,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.resetBtnText}>{t("admin.clearFilter")}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyAdminItemRow
              item={item}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
              onView={onView}
              onRequestChanges={onRequestChanges}
              isMutating={isMutating}
              isHighlighted={highlightId === item.id}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={hasMore ? onLoadMore : undefined}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            hasMore ? (
              <Pressable
                onPress={onLoadMore}
                style={({ pressed, hovered }: PressState) => [
                  styles.loadMoreBtn,
                  hovered && styles.loadMoreBtnHovered,
                  pressed && styles.loadMoreBtnPressed,
                  webPointer,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("admin.loadMore")}
              >
                <Text style={styles.loadMoreText}>{t("admin.loadMore")}</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colorTokens.brand,
    borderColor: colorTokens.brand,
  },
  filterChipHovered: {
    backgroundColor: colorTokens.cardBorder,
  },
  filterChipPressed: {
    opacity: 0.8,
  },
  filterText: {
    fontSize: 13,
    fontFamily: fontTokens.medium,
    color: colorTokens.textSecondary,
  },
  filterTextActive: {
    color: colorTokens.onBrand,
    fontFamily: fontTokens.bold,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontFamily: fontTokens.regular,
    color: colorTokens.textPrimary,
  },
  clearSearchBtn: {
    padding: 6,
    borderRadius: radius.pill,
  },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colorTokens.brandSurface,
    borderWidth: 1,
    borderColor: colorTokens.brand,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  highlightBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  highlightBannerText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.brandText,
  },
  clearHighlightBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
  },
  clearHighlightBtnHovered: {
    backgroundColor: colorTokens.backgroundAlt,
  },
  clearHighlightBtnPressed: {
    opacity: 0.8,
  },
  clearHighlightBtnText: {
    fontSize: 12,
    fontFamily: fontTokens.medium,
    color: colorTokens.textSecondary,
  },
  countRow: {
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
    fontVariant: ["tabular-nums"],
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: 10,
    backgroundColor: colorTokens.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    maxWidth: 360,
  },
  resetBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
  },
  resetBtnHovered: {
    backgroundColor: colorTokens.cardBorder,
  },
  resetBtnPressed: {
    opacity: 0.8,
  },
  resetBtnText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
  loadMoreBtn: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    marginTop: 8,
  },
  loadMoreBtnHovered: {
    backgroundColor: colorTokens.cardBorder,
  },
  loadMoreBtnPressed: {
    opacity: 0.8,
  },
  loadMoreText: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.textPrimary,
  },
});
