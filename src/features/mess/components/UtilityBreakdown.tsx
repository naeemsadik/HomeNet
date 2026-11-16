import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts, radius } from "@/theme";
import { CHARGE_CATEGORIES } from "../constants/vocabulary";
import { useMessDetail } from "../hooks/useMessQueries";
import type { UtilityCharge } from "../types/mess";
import { allInCost, cheapestAllIn } from "../utils/allInCost";
import { formatTaka, formatTakaRange } from "../utils/format";
import { MessSheet } from "./MessSheet";

export interface UtilityBreakdownProps {
  rent: number;
  charges: UtilityCharge[];
  deposit?: number | null;
  advanceMonths?: number;
}

/** One row per bill: how it is billed and what it adds, then the all-in total (PRD D1). */
export function UtilityBreakdownTable({ rent, charges, deposit, advanceMonths }: UtilityBreakdownProps) {
  const { t, language } = useTranslation();
  const total = allInCost(rent, charges);
  const missing = CHARGE_CATEGORIES.filter((category) => !charges.some((charge) => charge.category === category));

  return (
    <View style={styles.table}>
      <Row label={t("mess.breakdown.rent")} value={formatTaka(rent, language)} />
      {CHARGE_CATEGORIES.map((category) => {
        const charge = charges.find((row) => row.category === category);
        const label = t(`mess.charge.${category}`);
        if (!charge) return <Row key={category} label={label} value={t("mess.detail.notSaid")} muted warn />;
        if (charge.billing === "included" || charge.billing === "not_applicable") {
          return <Row key={category} label={label} note={charge.note} value={t(`mess.billingLong.${charge.billing}`)} muted />;
        }
        const value =
          charge.billing === "fixed"
            ? formatTaka(charge.amount_min ?? 0, language)
            : formatTakaRange(charge.amount_min ?? 0, charge.amount_max ?? charge.amount_min ?? 0, language, t);
        return <Row key={category} label={label} note={charge.note} value={value} tag={charge.billing === "variable" ? t("mess.billing.variable") : undefined} />;
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t("mess.breakdown.total")}</Text>
        <NoTranslateText style={styles.totalValue}>{formatTakaRange(total.min, total.max, language, t)}</NoTranslateText>
      </View>
      {deposit !== undefined ? (
        <Row label={t("mess.breakdown.deposit")} value={deposit ? formatTaka(deposit, language) : t("mess.breakdown.none")} />
      ) : null}
      {advanceMonths !== undefined ? (
        <Row
          label={t("mess.breakdown.advance")}
          value={
            advanceMonths === 0
              ? t("mess.breakdown.none")
              : advanceMonths === 1
                ? t("mess.breakdown.advanceOne")
                : t("mess.breakdown.advanceMonths", { count: formatLocalizedNumber(advanceMonths, language) })
          }
        />
      ) : null}
      {missing.length ? (
        <View style={styles.warning}>
          <AlertCircle size={16} color={colorTokens.warningText} />
          <Text style={styles.warningText}>
            {t("mess.breakdown.incomplete", { missing: missing.map((category) => t(`mess.charge.${category}`)).join(", ") })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value, note, tag, muted, warn }: { label: string; value: string; note?: string | null; tag?: string; muted?: boolean; warn?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label}>{label}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <View style={styles.valueCol}>
        <NoTranslateText style={[styles.value, muted && styles.valueMuted, warn && styles.valueWarn]}>{value}</NoTranslateText>
        {tag ? <Text style={styles.tag}>{tag}</Text> : null}
      </View>
    </View>
  );
}

/** The breakdown in a sheet (PRD 3.2.1 props). */
export function UtilityBreakdownModal({ visible, onClose, ...table }: UtilityBreakdownProps & { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <MessSheet visible={visible} onClose={onClose} title={t("mess.breakdown.title")} closeLabel={t("mess.breakdown.close")} width={480}>
      <UtilityBreakdownTable {...table} />
    </MessSheet>
  );
}

/**
 * The breakdown for a search result. Cards carry no charges, so the listing's
 * detail is loaded (or read from the cache the card's press warmed).
 */
export function CardBreakdownModal({ id, visible, onClose }: { id: string; visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const detail = useMessDetail(visible ? id : undefined);
  const cheapest = detail.data ? cheapestAllIn(detail.data.seats, detail.data.charges) : null;

  return (
    <MessSheet visible={visible} onClose={onClose} title={t("mess.breakdown.title")} closeLabel={t("mess.breakdown.close")} width={480}>
      {detail.data && cheapest ? (
        <UtilityBreakdownTable
          rent={cheapest.rent}
          charges={detail.data.charges}
          deposit={detail.data.mess.security_deposit}
          advanceMonths={detail.data.mess.advance_months}
        />
      ) : detail.isError ? (
        <Text style={styles.state}>{t("mess.detail.loadFailed")}</Text>
      ) : detail.data ? (
        <Text style={styles.state}>{t("mess.cost.noOpenSeat")}</Text>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={colorTokens.brand} />
          <Text style={styles.state}>{t("mess.breakdown.loading")}</Text>
        </View>
      )}
    </MessSheet>
  );
}

const styles = StyleSheet.create({
  table: { gap: 0 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  labelCol: { flex: 1, gap: 2 },
  valueCol: { alignItems: "flex-end", gap: 2 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colorTokens.ink },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  value: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink, textAlign: "right" },
  valueMuted: { fontFamily: fonts.regular, color: colorTokens.muted },
  valueWarn: { color: colorTokens.warningText },
  tag: { fontFamily: fonts.medium, fontSize: 11, color: colorTokens.muted },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
  },
  totalLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.brandText },
  totalValue: { fontFamily: fonts.headingBold, fontSize: 17, color: colorTokens.ink },
  warning: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colorTokens.warningSurface,
  },
  warningText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.warningText },
  loading: { alignItems: "center", gap: 10, paddingVertical: 24 },
  state: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted, textAlign: "center" },
});
