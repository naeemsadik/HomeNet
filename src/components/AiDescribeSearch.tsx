import { AlertTriangle, ArrowRight, Search, Sparkles } from "@/components/icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import { LiveText } from "@/components/LiveText";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton } from "@/components/ui";
import { useSmartSearch } from "@/features/property/hooks/useSmartSearch";
import type { Property } from "@/features/property/types/property";
import { describeFilters, toCardProperty } from "@/features/property/utils/aiSearchFilters";
import { useSavedStore } from "@/stores/savedStore";
import { sanitizeErrorMessage } from "@/lib/errorSanitizer";
import { colorTokens, colors, fonts, webPointer } from "@/theme";

/** The API's limit on a query (3–300 characters). */
const MAX_QUERY_LENGTH = 300;
const MIN_QUERY_LENGTH = 3;

const EXAMPLES = [
  "3 bedroom flat for sale in Gulshan under 3 crore",
  "2 bedroom apartment to rent in Dhanmondi, up to 40 thousand, with parking",
  "Land in Uttara between 50 lakh and 1.5 crore",
];

interface AiDescribeSearchProps {
  /** A query the seeker already typed elsewhere; it is searched straight away. */
  initialPrompt?: string;
  onClose?: () => void;
  /** Offered when AI search can't run, so the seeker is never stuck. */
  onUseGuided: () => void;
}

export function AiDescribeSearch({ initialPrompt = "", onClose, onUseGuided }: AiDescribeSearchProps) {
  const [text, setText] = useState(initialPrompt);
  // The query that was actually sent; typing doesn't search until Find is pressed.
  const [submitted, setSubmitted] = useState<string | null>(initialPrompt.trim().length >= MIN_QUERY_LENGTH ? initialPrompt.trim() : null);
  const { toggleSaved, isSaved } = useSavedStore();

  const search = useSmartSearch(submitted);
  const trimmed = text.trim();
  const isSearching = search.isFetching && !search.isFetchingNextPage;
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH && !isSearching;

  const runSearch = () => {
    if (!canSearch) return;
    if (trimmed === submitted) void search.refetch();
    else setSubmitted(trimmed);
  };

  const firstPage = search.data?.pages[0];
  const chips = useMemo(() => (firstPage ? describeFilters(firstPage.filters) : []), [firstPage]);
  const listings = useMemo(() => search.data?.pages.flatMap((page) => page.listings) ?? [], [search.data]);
  const total = firstPage?.pagination.total ?? 0;
  const forRent = firstPage?.filters.listing_type === "rent" || firstPage?.filters.listing_type === "short_let";

  const openProperty = useCallback(
    (property: Property) => {
      onClose?.();
      router.push(`/property/${property.id}` as Href);
    },
    [onClose],
  );
  const browseAll = () => {
    onClose?.();
    router.push(forRent ? "/rent" : "/buy");
  };

  const error = search.error;
  const offerGuided = error?.code === "UNAVAILABLE" || error?.code === "QUOTA_EXCEEDED";
  const hasResult = Boolean(firstPage) && !error;

  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityHint="Describe the home you want in your own words"
        accessibilityLabel="Describe the home you want"
        editable={!isSearching}
        maxLength={MAX_QUERY_LENGTH}
        multiline
        onChangeText={setText}
        onSubmitEditing={runSearch}
        placeholder="e.g. 3 bedroom flat for sale in Gulshan under 3 crore"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={[styles.input, isSearching && styles.inputDisabled]}
        textAlignVertical="top"
        value={text}
      />

      {!hasResult && !isSearching ? (
        <View style={styles.examples}>
          {EXAMPLES.map((example) => (
            <Pressable
              accessibilityRole="button"
              key={example}
              onPress={() => setText(example)}
              style={({ hovered, pressed }: PressableStateCallbackType & { hovered?: boolean }) => [
                styles.example,
                hovered && styles.exampleHover,
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <AppButton
          disabled={!canSearch}
          icon={Search}
          label={isSearching ? "Reading your search…" : "Find homes"}
          loading={isSearching}
          onPress={runSearch}
        />
        <Text style={styles.hint}>AI reads your words into filters. Only verified listings are shown.</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <AlertTriangle color={colorTokens.warningText} size={16} />
          <Text style={styles.errorText}>{sanitizeErrorMessage(error.message)}</Text>
          {offerGuided ? (
            <Pressable
              accessibilityRole="button"
              onPress={onUseGuided}
              style={({ pressed }) => [styles.errorButton, pressed && styles.pressed, webPointer]}
            >
              <Text style={styles.errorButtonText}>Answer guided questions</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {hasResult ? (
        <View style={styles.results}>
          <View style={styles.understoodHeader}>
            <Sparkles color={colors.greenOnLight} size={16} />
            <Text style={styles.understoodTitle}>What we understood</Text>
            <Pressable
              accessibilityLabel="Start a new search"
              accessibilityRole="button"
              onPress={() => setSubmitted(null)}
              style={[styles.newSearch, webPointer]}
            >
              <Text style={styles.newSearchText}>New search</Text>
            </Pressable>
          </View>

          {chips.length > 0 ? (
            <>
              <View style={styles.chips}>
                {chips.map((chip) => (
                  <View key={chip.id} style={styles.chip}>
                    <Text style={styles.chipText}>{chip.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.notice}>Wrong? Change your words above and search again.</Text>
            </>
          ) : (
            <Text style={styles.notice}>
              We couldn't pick out a place, a kind of property or a budget. Try mentioning where, what kind, or how much.
            </Text>
          )}

          {chips.length > 0 ? (
            listings.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No verified listings match all of this yet</Text>
                <Text style={styles.emptyText}>
                  Try a wider budget or fewer requirements, or browse everything that's listed.
                </Text>
                <AppButton
                  label={`Browse all ${forRent ? "rentals" : "properties for sale"}`}
                  onPress={browseAll}
                  style={styles.emptyAction}
                />
              </View>
            ) : (
              <View style={styles.grid}>
                <LiveText style={styles.count}>
                  {total} verified {total === 1 ? "listing" : "listings"} found
                </LiveText>
                <PropertyGrid>
                  {listings.map((listing) => (
                    <View key={listing.id} style={styles.cardWrap}>
                      <PropertyCard
                        onPress={openProperty}
                        onSave={toggleSaved}
                        property={toCardProperty(listing)}
                        saved={isSaved(listing.id)}
                      />
                      {listing.ai_badges.length > 0 ? (
                        <View accessibilityLabel={`AI notes: ${listing.ai_badges.join(", ")}`} style={styles.badges}>
                          <Sparkles color={colors.greenOnLight} size={12} />
                          {listing.ai_badges.map((badge) => (
                            <View key={badge} style={styles.badge}>
                              <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </PropertyGrid>

                {search.hasNextPage ? (
                  <AppButton
                    label="Show more"
                    loading={search.isFetchingNextPage}
                    onPress={() => void search.fetchNextPage()}
                    variant="secondary"
                  />
                ) : null}
                <AppButton
                  label={`View all ${forRent ? "rental" : "sale"} properties`}
                  onPress={browseAll}
                  trailingIcon={ArrowRight}
                  variant="ghost"
                />
              </View>
            )
          ) : null}

          <Text style={styles.disclaimer}>
            AI can misread a search, and its notes on each listing are written by AI. Check the listing for the facts.
          </Text>
        </View>
      ) : null}

      {isSearching && !firstPage ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  pressed: { opacity: 0.85 },

  input: {
    minHeight: 96,
    borderWidth: 1.2,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FAFBFA",
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    ...({ outlineStyle: "none" } as object),
  },
  inputDisabled: { opacity: 0.55 },

  examples: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  example: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  exampleHover: { backgroundColor: colors.greenLight, borderColor: colors.green },
  exampleText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12.5 },

  actionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 },
  hint: { flex: 1, minWidth: 200, color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },

  errorBanner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(217, 106, 36, 0.25)",
    backgroundColor: "#FEF3E4",
  },
  errorText: { flex: 1, minWidth: 180, color: colorTokens.warningText, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  errorButton: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colorTokens.warningText },
  errorButtonText: { color: "#FFFFFF", fontFamily: fonts.semiBold, fontSize: 12 },

  results: { gap: 12, marginTop: 4 },
  understoodHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  understoodTitle: { flex: 1, color: colors.ink, fontFamily: fonts.semiBold, fontSize: 14 },
  newSearch: { paddingHorizontal: 8, paddingVertical: 4 },
  newSearchText: { color: colors.greenOnLight, fontFamily: fonts.semiBold, fontSize: 13, textDecorationLine: "underline" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.greenLight },
  chipText: { color: colors.greenOnLight, fontFamily: fonts.semiBold, fontSize: 12.5 },
  notice: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },

  center: { padding: 28, alignItems: "center" },
  grid: { gap: 14 },
  count: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 14 },
  cardWrap: { gap: 8 },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingHorizontal: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.greenLight },
  badgeText: { color: colors.greenOnLight, fontFamily: fonts.medium, fontSize: 11.5 },
  empty: { padding: 24, alignItems: "center", borderRadius: 16, backgroundColor: "#F8FAF9" },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15, textAlign: "center" },
  emptyText: { marginTop: 6, color: colors.muted, fontFamily: fonts.regular, fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyAction: { marginTop: 14 },
  disclaimer: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textAlign: "center", lineHeight: 17 },
});
