import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, FileCheck2, X } from "@/components/icons";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { MessDetail } from "../types/mess";
import { completenessChecks, type CompletenessCheck } from "../utils/completeness";

/**
 * What a moderator needs before approving a mess listing: the submit-time
 * checks (PRD 2.3.4), each marked done or missing. A listing edited after it
 * was submitted can lose something the check passed, so it is read from the
 * listing as it is now.
 *
 * It sits above the listing, so it stays short: what is missing is always
 * shown, and the checks that pass are one tap away.
 */
export function ReviewChecklist({ detail }: { detail: MessDetail }) {
  const { t, language } = useTranslation();
  const [showPassed, setShowPassed] = useState(false);
  const checks = completenessChecks(detail);
  const missing = checks.filter((check) => !check.ok);
  const passed = checks.filter((check) => check.ok);
  const summary =
    missing.length === 0
      ? t("mess.review.allGood")
      : missing.length === 1
        ? t("mess.review.missingOne")
        : t("mess.review.missingCount", { count: formatLocalizedNumber(missing.length, language) });

  const row = (check: CompletenessCheck) => {
    const label = t(`mess.review.checks.${check.key}`);
    return (
      <View key={check.key} style={styles.row} accessibilityLabel={`${label}: ${check.ok ? t("mess.review.done") : t("mess.review.missing")}`}>
        {check.ok ? (
          <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
        ) : (
          <X size={16} color={colorTokens.errorText} strokeWidth={2.5} />
        )}
        <Text style={[styles.rowText, !check.ok && styles.rowTextMissing]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.head}>
        <FileCheck2 size={18} color={colorTokens.brandText} />
        <Text accessibilityRole="header" aria-level={2} style={styles.title}>
          {t("mess.review.title")}
        </Text>
      </View>
      <Text style={styles.intro}>{t("mess.review.intro")}</Text>
      <Text style={[styles.summary, missing.length > 0 && styles.summaryMissing]}>{summary}</Text>
      {missing.length ? <View style={styles.list}>{missing.map(row)}</View> : null}
      {passed.length ? (
        <>
          <Pressable
            accessibilityRole="button"
            aria-expanded={showPassed}
            onPress={() => setShowPassed((open) => !open)}
            style={[styles.toggle, webPointer]}
          >
            <Text style={styles.toggleText}>
              {showPassed
                ? t("mess.review.hidePassed")
                : t("mess.review.showPassed", { count: formatLocalizedNumber(passed.length, language) })}
            </Text>
            <ChevronDown size={16} color={colorTokens.brandText} style={showPassed ? styles.chevronOpen : undefined} />
          </Pressable>
          {showPassed ? <View style={styles.list}>{passed.map(row)}</View> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  intro: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colorTokens.muted },
  summary: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  summaryMissing: { color: colorTokens.errorText },
  list: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 200 },
  rowText: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.body },
  rowTextMissing: { color: colorTokens.errorText },
  toggle: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", minHeight: 44 },
  toggleText: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
});
