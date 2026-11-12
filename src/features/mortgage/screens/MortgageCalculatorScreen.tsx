import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import { AppButton, Eyebrow } from "@/components/ui";
import { ChoiceChips, FieldBlock, textInputStyle } from "@/features/valuation/components/FormKit";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, layout, radius, webPointer } from "@/theme";
import { affordabilityFor, parseAmount, paymentFor } from "../utils/mortgageMath";

type Mode = "payment" | "afford";

const TERMS = [10, 15, 20, 25] as const;
const INCOME_SHARES = [30, 40, 50] as const;

const TABS: { mode: Mode; labelKey: TranslationKey }[] = [
  { mode: "payment", labelKey: "mortgage.tabPayment" },
  { mode: "afford", labelKey: "mortgage.tabAfford" },
];

/** Whole Taka with the reader's digits and grouping. */
function taka(amount: number, language: "en" | "bn"): string {
  return `৳ ${Math.round(amount).toLocaleString(language === "bn" ? "bn-BD" : "en-IN")}`;
}

function NumberField({
  label,
  hint,
  error,
  optional,
  value,
  onChange,
  placeholder,
  decimal = false,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  decimal?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <FieldBlock hint={error ? undefined : hint} label={label} optional={optional} optionalLabel={t("mortgage.optional")}>
      <TextInput
        accessibilityLabel={label}
        inputMode={decimal ? "decimal" : "numeric"}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        onChangeText={(text) => onChange(text.replace(decimal ? /[^\d.]/g : /[^\d,]/g, ""))}
        placeholder={placeholder}
        placeholderTextColor={colorTokens.subtle}
        style={[textInputStyle, error ? styles.inputError : null]}
        value={value}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </FieldBlock>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/**
 * Home-loan calculator: what a flat costs each month, or what price an income
 * can carry. Nothing here is a bank's figure. The reader types the interest
 * rate and picks the term and the share of income, and the page says so.
 */
export function MortgageCalculatorScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { isPhone, isTablet } = useResponsive();
  const stacked = isPhone || isTablet;

  const [mode, setMode] = useState<Mode>("payment");
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [income, setIncome] = useState("");
  const [existing, setExisting] = useState("");
  const [savings, setSavings] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState<number>(20);
  const [share, setShare] = useState<number>(40);

  const ratePct = parseAmount(rate);
  const priceValue = parseAmount(price);
  const downValue = parseAmount(downPayment) ?? 0;
  const downTooHigh = priceValue !== null && priceValue > 0 && downValue >= priceValue;

  const payment = useMemo(
    () =>
      priceValue === null || ratePct === null
        ? null
        : paymentFor({ price: priceValue, downPayment: downValue, annualRatePct: ratePct, years }),
    [priceValue, downValue, ratePct, years],
  );

  const incomeValue = parseAmount(income);
  const afford = useMemo(
    () =>
      incomeValue === null || ratePct === null
        ? null
        : affordabilityFor({
            monthlyIncome: incomeValue,
            existingInstalments: parseAmount(existing) ?? 0,
            incomeSharePct: share,
            savings: parseAmount(savings) ?? 0,
            annualRatePct: ratePct,
            years,
          }),
    [incomeValue, existing, share, savings, ratePct, years],
  );

  const money = (amount: number) => taka(amount, language);
  const termOptions = TERMS.map((value) => ({ value, label: t("mortgage.years", { count: value }) }));
  const shareOptions = INCOME_SHARES.map((value) => ({ value, label: t("mortgage.percent", { count: value }) }));

  const loanFields = (
    <>
      <NumberField
        decimal
        hint={t("mortgage.rateHint")}
        label={t("mortgage.rateLabel")}
        onChange={setRate}
        value={rate}
      />
      <FieldBlock hint={t("mortgage.termHint")} label={t("mortgage.termLabel")}>
        <ChoiceChips
          accessibilityLabel={t("mortgage.termLabel")}
          onChange={(value) => typeof value === "number" && setYears(value)}
          options={termOptions}
          value={years}
        />
      </FieldBlock>
    </>
  );

  // The share of what is repaid that is the loan itself; the rest is interest.
  const split = payment && payment.totalRepaid > 0 ? payment.loan / payment.totalRepaid : null;

  return (
    <AppChrome>
      <View style={[styles.page, isPhone && styles.pagePhone]}>
        <View style={styles.hero}>
          <Eyebrow>{t("mortgage.eyebrow")}</Eyebrow>
          <Text accessibilityRole="header" aria-level={1} style={[styles.title, isPhone && styles.titlePhone]}>
            {t("mortgage.headline")}
          </Text>
          <Text style={styles.intro}>{t("mortgage.intro")}</Text>
        </View>

        <View accessibilityRole="tablist" style={[styles.tabs, isPhone && styles.tabsPhone]}>
          {TABS.map((tab) => {
            const selected = mode === tab.mode;
            return (
              <Pressable
                key={tab.mode}
                accessibilityLabel={t(tab.labelKey)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setMode(tab.mode)}
                style={({ pressed }) => [
                  styles.tab,
                  selected && styles.tabSelected,
                  pressed && !selected && styles.pressed,
                  webPointer,
                ]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{t(tab.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.columns, stacked && styles.columnsStacked]}>
          <View style={[styles.card, styles.form]}>
            {mode === "payment" ? (
              <>
                <NumberField label={t("mortgage.priceLabel")} onChange={setPrice} value={price} />
                <NumberField
                  error={downTooHigh ? t("mortgage.downTooHigh") : undefined}
                  hint={t("mortgage.downHint")}
                  label={t("mortgage.downLabel")}
                  onChange={setDownPayment}
                  optional
                  value={downPayment}
                />
              </>
            ) : (
              <>
                <NumberField
                  hint={t("mortgage.incomeHint")}
                  label={t("mortgage.incomeLabel")}
                  onChange={setIncome}
                  value={income}
                />
                <NumberField
                  hint={t("mortgage.existingHint")}
                  label={t("mortgage.existingLabel")}
                  onChange={setExisting}
                  optional
                  value={existing}
                />
                <FieldBlock hint={t("mortgage.shareHint")} label={t("mortgage.shareLabel")}>
                  <ChoiceChips
                    accessibilityLabel={t("mortgage.shareLabel")}
                    onChange={(value) => typeof value === "number" && setShare(value)}
                    options={shareOptions}
                    value={share}
                  />
                </FieldBlock>
                <NumberField
                  hint={t("mortgage.savingsHint")}
                  label={t("mortgage.savingsLabel")}
                  onChange={setSavings}
                  optional
                  value={savings}
                />
              </>
            )}
            {loanFields}
          </View>

          <View
            accessibilityLiveRegion="polite"
            style={[styles.card, styles.result, stacked && styles.resultStacked]}
          >
            {mode === "payment" ? (
              payment ? (
                <>
                  <Text style={styles.resultLabel}>{t("mortgage.monthlyPayment")}</Text>
                  <Text style={styles.resultFigure}>{money(payment.instalment)}</Text>
                  <Text style={styles.resultSub}>{t("mortgage.forYears", { count: years })}</Text>

                  {split !== null ? (
                    <View style={styles.split}>
                      <View
                        accessibilityLabel={t("mortgage.splitA11y", {
                          loan: money(payment.loan),
                          interest: money(payment.totalInterest),
                        })}
                        accessibilityRole="image"
                        style={styles.splitBar}
                      >
                        <View style={[styles.splitLoan, { flex: split }]} />
                        <View style={[styles.splitInterest, { flex: 1 - split }]} />
                      </View>
                      <View style={styles.legend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.swatch, styles.splitLoan]} />
                          <Text style={styles.legendText}>{t("mortgage.loanAmount")}</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.swatch, styles.splitInterest]} />
                          <Text style={styles.legendText}>{t("mortgage.totalInterest")}</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  <ResultRow label={t("mortgage.loanAmount")} value={money(payment.loan)} />
                  <ResultRow label={t("mortgage.totalInterest")} value={money(payment.totalInterest)} />
                  <ResultRow label={t("mortgage.totalRepaid")} value={money(payment.totalRepaid)} />
                  {/* With no down payment entered, "৳ 0 upfront" would read as a promise. */}
                  {payment.cashUpfront > 0 ? (
                    <ResultRow label={t("mortgage.cashUpfront")} value={money(payment.cashUpfront)} />
                  ) : null}
                  <Text style={styles.resultNote}>{t("mortgage.cashNote")}</Text>
                </>
              ) : (
                <Text style={styles.empty}>{t("mortgage.emptyPayment")}</Text>
              )
            ) : afford ? (
              afford.instalment > 0 ? (
                <>
                  <Text style={styles.resultLabel}>{t("mortgage.affordPrice")}</Text>
                  <Text style={styles.resultFigure}>{money(afford.price)}</Text>
                  <Text style={styles.resultSub}>{t("mortgage.affordSub", { share, count: years })}</Text>
                  <ResultRow label={t("mortgage.monthlyPayment")} value={money(afford.instalment)} />
                  <ResultRow label={t("mortgage.loanAmount")} value={money(afford.loan)} />
                  <ResultRow label={t("mortgage.totalInterest")} value={money(afford.totalInterest)} />
                  <Text style={styles.resultNote}>{t("mortgage.affordNote")}</Text>
                </>
              ) : (
                <Text style={styles.empty}>{t("mortgage.nothingLeft")}</Text>
              )
            ) : (
              <Text style={styles.empty}>{t("mortgage.emptyAfford")}</Text>
            )}
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteTitle}>{t("mortgage.noteTitle")}</Text>
          <Text style={styles.noteBody}>{t("mortgage.noteBody")}</Text>
          <View style={styles.noteAction}>
            <AppButton label={t("mortgage.browse")} onPress={() => router.push("/buy")} variant="secondary" />
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  pagePhone: { paddingHorizontal: layout.gutterPhone, paddingTop: 24, paddingBottom: 48 },
  hero: { maxWidth: 680, marginBottom: 24 },
  title: {
    marginTop: 8,
    fontFamily: fonts.headingBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: colorTokens.ink,
  },
  titlePhone: { fontSize: 26, lineHeight: 33 },
  intro: { marginTop: 12, fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colorTokens.body },
  tabs: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 4,
    gap: 4,
    marginBottom: 16,
    borderRadius: radius.xl,
    backgroundColor: colorTokens.surfaceSunken,
  },
  tabsPhone: { alignSelf: "stretch" },
  tab: {
    flexGrow: 1,
    minHeight: layout.touchTarget,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  tabSelected: { backgroundColor: colorTokens.surface },
  tabText: { fontFamily: fonts.medium, fontSize: 15, color: colorTokens.muted, textAlign: "center" },
  tabTextSelected: { fontFamily: fonts.semiBold, color: colorTokens.ink },
  pressed: { opacity: 0.7 },
  columns: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  columnsStacked: { flexDirection: "column", alignItems: "stretch" },
  card: {
    borderWidth: 1,
    borderColor: colorTokens.divider,
    borderRadius: radius.card,
    backgroundColor: colorTokens.surface,
    padding: 20,
  },
  form: { flex: 1, gap: 20 },
  inputError: { borderColor: colorTokens.errorText },
  errorText: { marginTop: 8, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colorTokens.errorText },
  result: {
    width: 380,
    backgroundColor: colorTokens.brandSurface,
    borderColor: colorTokens.brandBorder,
  },
  resultStacked: { width: "100%" },
  resultLabel: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20, color: colorTokens.brandText },
  resultFigure: {
    marginTop: 4,
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 42,
    color: colorTokens.ink,
    fontVariant: ["tabular-nums"],
  },
  resultSub: { marginTop: 2, marginBottom: 16, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colorTokens.body },
  split: { marginBottom: 12 },
  splitBar: { flexDirection: "row", height: 10, borderRadius: radius.sm, overflow: "hidden", gap: 2 },
  splitLoan: { backgroundColor: colorTokens.brandText },
  splitInterest: { backgroundColor: colorTokens.muted },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontFamily: fonts.regular, fontSize: 13, color: colorTokens.body },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colorTokens.brandBorder,
  },
  rowLabel: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colorTokens.body },
  rowValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colorTokens.ink,
    fontVariant: ["tabular-nums"],
  },
  resultNote: { marginTop: 8, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colorTokens.body },
  empty: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colorTokens.body },
  note: { marginTop: 24, padding: 20, borderRadius: radius.card, backgroundColor: colorTokens.surfaceSunken },
  noteTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  noteBody: { marginTop: 6, maxWidth: 720, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colorTokens.body },
  noteAction: { marginTop: 16, alignSelf: "flex-start" },
});
