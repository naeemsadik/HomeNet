import { AlertTriangle, ArrowRight, Search, Sparkles, X } from "@/components/icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { LiveText } from "@/components/LiveText";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton } from "@/components/ui";
import { useAllAreas } from "@/hooks/useAllAreas";
import { useParsePropertySearch } from "@/features/property/hooks/useParsePropertySearch";
import type { AiParsedSearch } from "@/features/property/types/aiSearch";
import type { Property } from "@/features/property/types/property";
import {
  describeSearch,
  toSearchQuery,
  withoutFields,
  type SearchChip,
} from "@/features/property/utils/aiSearchFilters";
import { getPropertiesInAreas } from "@/services/propertyApi";
import { useSavedStore } from "@/stores/savedStore";
import { colorTokens, colors, fonts, webPointer } from "@/theme";

const MAX_QUERY_LENGTH = 500;
const MIN_QUERY_LENGTH = 3;

const EXAMPLES = [
  "3 bedroom flat for sale in Gulshan under 3 crore",
  "2 bedroom apartment to rent in Dhanmondi, up to 40 thousand",
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
  const [parsed, setParsed] = useState<AiParsedSearch | null>(null);
  // Once a chip is removed the AI's one-line summary no longer describes the search.
  const [edited, setEdited] = useState(false);
  const { mutate: runParse, isPending, error: parseError, reset } = useParsePropertySearch();
  const { toggleSaved, isSaved } = useSavedStore();

  const trimmed = text.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH && !isPending;

  const search = useCallback(
    (query: string) => {
      const clean = query.trim();
      if (clean.length < MIN_QUERY_LENGTH) return;
      runParse(clean, {
        onSuccess: (result) => {
          setEdited(false);
          setParsed(result);
        },
      });
    },
    [runParse],
  );

  // A query typed in the hero search box starts working immediately, once.
  const autoRan = useRef(false);
  useEffect(() => {
    if (initialPrompt.trim() && !autoRan.current) {
      autoRan.current = true;
      search(initialPrompt);
    }
  }, [initialPrompt, search]);

  const areas = useAllAreas({ enabled: parsed !== null });
  const query = useMemo(
    () => (parsed ? toSearchQuery(parsed, areas.data?.items ?? []) : null),
    [parsed, areas.data],
  );
  const chips = useMemo(() => (parsed && query ? describeSearch(parsed, query.area) : []), [parsed, query]);

  const results = useQuery({
    queryKey: ["properties", "ai-search", query?.filters, query?.areaIds],
    queryFn: () => getPropertiesInAreas(query!.filters, query!.areaIds),
    // With no filter understood the API would return everything, which is not an answer.
    enabled: Boolean(query) && chips.length > 0 && !areas.isLoading,
    staleTime: 5 * 60 * 1000,
  });

  const removeChip = (chip: SearchChip) => {
    setEdited(true);
    setParsed((current) => (current ? withoutFields(current, chip.fields) : current));
  };

  const openProperty = useCallback(
    (property: Property) => {
      onClose?.();
      router.push(`/property/${property.id}` as Href);
    },
    [onClose],
  );

  const offerGuided = parseError?.code === "UNAVAILABLE" || parseError?.code === "QUOTA_EXCEEDED";
  const items = results.data?.items ?? [];
  const total = results.data?.total ?? 0;
  const forRent = parsed?.listingType === "rent";

  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityHint="Describe the home you want in your own words"
        accessibilityLabel="Describe the home you want"
        editable={!isPending}
        maxLength={MAX_QUERY_LENGTH}
        multiline
        onChangeText={setText}
        onSubmitEditing={() => search(text)}
        placeholder="e.g. 3 bedroom flat for sale in Gulshan under 3 crore"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={[styles.input, isPending && styles.inputDisabled]}
        textAlignVertical="top"
        value={text}
      />

      {!parsed && !isPending ? (
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
          label={isPending ? "Reading your search…" : "Find homes"}
          loading={isPending}
          onPress={() => search(text)}
        />
        <Text style={styles.hint}>AI reads your words into filters. Listings come from HomeNet's own search.</Text>
      </View>

      {parseError ? (
        <View style={styles.errorBanner}>
          <AlertTriangle color={colorTokens.warningText} size={16} />
          <Text style={styles.errorText}>{parseError.message}</Text>
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

      {parsed && !parseError ? (
        <View style={styles.results}>
          <View style={styles.understoodHeader}>
            <Sparkles color={colors.greenOnLight} size={16} />
            <Text style={styles.understoodTitle}>What we understood</Text>
            <Pressable
              accessibilityLabel="Start a new search"
              accessibilityRole="button"
              onPress={() => {
                setParsed(null);
                reset();
              }}
              style={[styles.newSearch, webPointer]}
            >
              <Text style={styles.newSearchText}>New search</Text>
            </Pressable>
          </View>

          {parsed.summary && !edited ? <Text style={styles.summary}>{parsed.summary}</Text> : null}

          {chips.length > 0 ? (
            <View style={styles.chips}>
              {chips.map((chip) => (
                <View key={chip.id} style={[styles.chip, chip.confidence === "low" && styles.chipLow]}>
                  <Text style={[styles.chipText, chip.confidence === "low" && styles.chipTextLow]}>
                    {chip.label}
                    {chip.confidence === "low" ? " (check this)" : ""}
                  </Text>
                  <Pressable
                    accessibilityLabel={`Remove ${chip.label}`}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => removeChip(chip)}
                    style={webPointer}
                  >
                    <X color={chip.confidence === "low" ? colorTokens.warningText : colors.greenOnLight} size={13} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.notice}>
              There's nothing to search on. Mention where, what kind of property, or your budget.
            </Text>
          )}

          {parsed.unmatched?.length ? (
            <Text style={styles.notice}>Not applied, because there's no filter for it: {parsed.unmatched.join(", ")}.</Text>
          ) : null}

          {chips.length > 0 ? (
            results.isLoading || areas.isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.green} />
              </View>
            ) : results.isError ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>We couldn't load listings</Text>
                <AppButton label="Try again" onPress={() => void results.refetch()} style={styles.emptyAction} />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No listings match all of this yet</Text>
                <Text style={styles.emptyText}>
                  Remove a filter above to widen the search, or browse everything that's listed.
                </Text>
                <AppButton
                  label={`Browse all ${forRent ? "rentals" : "properties for sale"}`}
                  onPress={() => {
                    onClose?.();
                    router.push(forRent ? "/rent" : "/buy");
                  }}
                  style={styles.emptyAction}
                />
              </View>
            ) : (
              <View style={styles.grid}>
                <LiveText style={styles.count}>
                  {total} {total === 1 ? "listing" : "listings"} found
                </LiveText>
                <PropertyGrid>
                  {items.map((property) => (
                    <PropertyCard
                      key={property.id}
                      onPress={openProperty}
                      onSave={toggleSaved}
                      property={property}
                      saved={isSaved(property.id)}
                    />
                  ))}
                </PropertyGrid>
                <AppButton
                  label={`View all ${forRent ? "rental" : "sale"} properties`}
                  onPress={() => {
                    onClose?.();
                    router.push(forRent ? "/rent" : "/buy");
                  }}
                  trailingIcon={ArrowRight}
                  variant="secondary"
                />
              </View>
            )
          ) : null}

          <Text style={styles.disclaimer}>AI can misread a search. Remove or correct anything above.</Text>
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
  summary: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 9,
    paddingVertical: 6,
    backgroundColor: colors.greenLight,
  },
  chipLow: { backgroundColor: "#FEF3E4" },
  chipText: { color: colors.greenOnLight, fontFamily: fonts.semiBold, fontSize: 12.5 },
  chipTextLow: { color: colorTokens.warningText },
  notice: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },

  center: { padding: 28, alignItems: "center" },
  grid: { gap: 14 },
  count: { color: colors.ink, fontFamily: fonts.semiBold, fontSize: 14 },
  empty: { padding: 24, alignItems: "center", borderRadius: 16, backgroundColor: "#F8FAF9" },
  emptyTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15, textAlign: "center" },
  emptyText: { marginTop: 6, color: colors.muted, fontFamily: fonts.regular, fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyAction: { marginTop: 14 },
  disclaimer: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textAlign: "center" },
});
