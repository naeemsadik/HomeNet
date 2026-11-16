import { StyleSheet, Text, View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, Receipt } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { AppButton } from "@/components/ui";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { colorTokens, fonts, radius } from "@/theme";
import type { ChargeBilling } from "../../types/mess";
import { cheapestAllIn } from "../../utils/allInCost";
import { formatTakaRange } from "../../utils/format";
import type { MessListingForm } from "../../utils/wizardForm";
import { FieldBlock, NumberInput, Segmented, StepCard, Stepper, TextField, fieldStyles, useWizardField } from "./fields";

/** After this many answers, offer to mark the rest as included (PRD 3.3.1). */
const MARK_REST_AFTER = 3;

/**
 * Step 3: every bill answered, with a live all-in total. This is what earns
 * "All costs declared" (PRD D1).
 */
export function CostsStep() {
  const { t, language } = useTranslation();
  const { control, setValue, getValues, clearErrors } = useFormContext<MessListingForm>();
  const charges = useWatch({ control, name: "charges" });
  const seats = useWatch({ control, name: "seats" });
  const deposit = useWizardField("security_deposit");
  const advance = useWizardField("advance_months");

  const answered = charges.filter((charge) => charge.billing !== null) as (MessListingForm["charges"][number] & { billing: ChargeBilling })[];
  const remaining = charges.length - answered.length;
  const cheapest = cheapestAllIn(
    seats.filter((seat) => seat.rent !== null).map((seat) => ({ rent: seat.rent!, status: seat.status ?? "available" })),
    answered,
  );

  const markRest = async () => {
    const ok = await confirmAction(t("mess.wizard.costs.markRestConfirmTitle"), t("mess.wizard.costs.markRestConfirm", { count: remaining }));
    if (!ok) return;
    getValues("charges").forEach((charge, index) => {
      if (charge.billing === null) setValue(`charges.${index}.billing`, "included", { shouldDirty: true });
    });
    clearErrors("charges");
  };

  return (
    <>
      <StepCard>
        <Text style={styles.intro}>{t("mess.wizard.costs.intro")}</Text>
        <View style={styles.badgeNote}>
          <Receipt size={16} color={colorTokens.brandText} />
          <Text style={styles.badgeNoteText}>{t("mess.wizard.costs.badgeNote")}</Text>
        </View>
        <View style={styles.total} accessibilityLiveRegion="polite">
          <Text style={styles.totalLabel}>{t("mess.wizard.costs.liveTotal")}</Text>
          {cheapest ? (
            <NoTranslateText style={styles.totalValue}>{formatTakaRange(cheapest.min, cheapest.max, language, t)}</NoTranslateText>
          ) : (
            <Text style={styles.totalHint}>{t("mess.wizard.costs.noSeatYet")}</Text>
          )}
          <View style={styles.progress}>
            {remaining === 0 ? <CheckCircle2 size={15} color={colorTokens.brandText} /> : null}
            <Text style={[styles.progressText, remaining === 0 && styles.progressDone]}>
              {remaining === 0
                ? t("mess.wizard.costs.allAnswered")
                : remaining === 1
                  ? t("mess.wizard.costs.remainingOne")
                  : t("mess.wizard.costs.remaining", { count: formatLocalizedNumber(remaining, language) })}
            </Text>
          </View>
          {answered.length >= MARK_REST_AFTER && remaining > 0 ? (
            <AppButton label={t("mess.wizard.costs.markRest")} onPress={() => void markRest()} variant="secondary" style={styles.markRest} />
          ) : null}
        </View>
      </StepCard>

      <StepCard>
        {charges.map((charge, index) => (
          <ChargeCategoryRow key={charge.category} index={index} />
        ))}
      </StepCard>

      <StepCard>
        <View style={fieldStyles.row}>
          <View style={fieldStyles.half}>
            <FieldBlock label={t("mess.wizard.costs.deposit")} error={deposit.error}>
              <NumberInput label={t("mess.wizard.costs.deposit")} prefix="৳" value={deposit.value} onChange={deposit.onChange} placeholder={t("mess.wizard.costs.depositPlaceholder")} />
            </FieldBlock>
          </View>
          <View style={fieldStyles.half}>
            <FieldBlock error={advance.error}>
              <Stepper label={t("mess.wizard.costs.advance")} value={advance.value} onChange={advance.onChange} min={0} max={6} />
            </FieldBlock>
          </View>
        </View>
      </StepCard>
    </>
  );
}

/**
 * One bill: how it is billed (included, fixed, varies, not applicable), with
 * amount fields that appear only when the answer needs them.
 */
export function ChargeCategoryRow({ index }: { index: number }) {
  const { t } = useTranslation();
  const { getValues } = useFormContext<MessListingForm>();
  const category = getValues(`charges.${index}.category`);
  const billing = useWizardField(`charges.${index}.billing`);
  const low = useWizardField(`charges.${index}.amount_min`);
  const high = useWizardField(`charges.${index}.amount_max`);
  const note = useWizardField(`charges.${index}.note`);
  const label = t(`mess.charge.${category}`);

  return (
    <View style={[styles.charge, billing.value === null && styles.chargeOpen]}>
      <FieldBlock label={label} error={billing.error}>
        <Segmented
          label={label}
          value={billing.value}
          onChange={billing.onChange}
          options={[
            { value: "included", label: t("mess.billing.included") },
            { value: "fixed", label: t("mess.billing.fixed") },
            { value: "variable", label: t("mess.billing.variable") },
            { value: "not_applicable", label: t("mess.billing.not_applicable") },
          ]}
        />
      </FieldBlock>
      {billing.value === "fixed" ? (
        <FieldBlock label={t("mess.wizard.costs.amount")} error={low.error}>
          <NumberInput label={`${label}: ${t("mess.wizard.costs.amount")}`} prefix="৳" value={low.value} onChange={low.onChange} />
        </FieldBlock>
      ) : null}
      {billing.value === "variable" ? (
        <View style={fieldStyles.row}>
          <View style={fieldStyles.half}>
            <FieldBlock label={t("mess.wizard.costs.low")} error={low.error}>
              <NumberInput label={`${label}: ${t("mess.wizard.costs.low")}`} prefix="৳" value={low.value} onChange={low.onChange} />
            </FieldBlock>
          </View>
          <View style={fieldStyles.half}>
            <FieldBlock label={t("mess.wizard.costs.high")} error={high.error}>
              <NumberInput label={`${label}: ${t("mess.wizard.costs.high")}`} prefix="৳" value={high.value} onChange={high.onChange} />
            </FieldBlock>
          </View>
        </View>
      ) : null}
      {billing.value !== null && billing.value !== "not_applicable" ? (
        <TextField label={`${label}: ${t("mess.wizard.costs.note")}`} value={note.value} onChange={note.onChange} placeholder={t("mess.wizard.costs.notePlaceholder")} maxLength={140} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colorTokens.body },
  badgeNote: { flexDirection: "row", gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colorTokens.brandSurface },
  badgeNoteText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colorTokens.brandText },
  total: { gap: 6, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colorTokens.border },
  totalLabel: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted },
  totalValue: { fontFamily: fonts.headingBold, fontSize: 24, color: colorTokens.ink },
  totalHint: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted },
  progress: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.warningText },
  progressDone: { color: colorTokens.brandText },
  markRest: { alignSelf: "flex-start", marginTop: 4 },
  charge: { gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colorTokens.divider },
  chargeOpen: {},
});
