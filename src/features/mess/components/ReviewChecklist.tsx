import { StyleSheet, Text, View } from "react-native";
import { Check, FileCheck2, X } from "@/components/icons";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import type { MessDetail } from "../types/mess";
import { completenessChecks } from "../utils/completeness";

/**
 * What a moderator needs before approving a mess listing: the submit-time
 * checks (PRD 2.3.4), each marked done or missing. A listing edited after it
 * was submitted can lose something the check passed, so it is read from the
 * listing as it is now.
 */
export function ReviewChecklist({ detail }: { detail: MessDetail }) {
  const { t, language } = useTranslation();
  const checks = completenessChecks(detail);
  const missing = checks.filter((check) => !check.ok).length;
  const summary =
    missing === 0
      ? t("mess.review.allGood")
      : missing === 1
        ? t("mess.review.missingOne")
        : t("mess.review.missingCount", { count: formatLocalizedNumber(missing, language) });

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.head}>
        <FileCheck2 size={18} color={colorTokens.brandText} />
        <Text accessibilityRole="header" aria-level={2} style={styles.title}>
          {t("mess.review.title")}
        </Text>
      </View>
      <Text style={styles.intro}>{t("mess.review.intro")}</Text>
      <Text style={[styles.summary, missing > 0 && styles.summaryMissing]}>{summary}</Text>
      <View style={styles.list}>
        {checks.map((check) => (
          <View
            key={check.key}
            style={styles.row}
            accessibilityLabel={`${t(`mess.review.checks.${check.key}`)}: ${check.ok ? t("mess.review.done") : t("mess.review.missing")}`}
          >
            {check.ok ? (
              <Check size={16} color={colorTokens.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colorTokens.errorText} strokeWidth={2.5} />
            )}
            <Text style={[styles.rowText, !check.ok && styles.rowTextMissing]}>{t(`mess.review.checks.${check.key}`)}</Text>
          </View>
        ))}
      </View>
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
});
