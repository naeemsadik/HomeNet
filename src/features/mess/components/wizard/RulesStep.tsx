import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { colorTokens, fonts } from "@/theme";
import { GUEST_POLICIES, MANAGED_BY, MAX_VIBE_TAGS, MEAL_SYSTEMS, SMOKING_POLICIES, TENANT_TYPES, VIBE_TAGS } from "../../constants/vocabulary";
import { MessChip } from "../MessChip";
import { FieldBlock, NumberInput, Segmented, StepCard, TextField, TimeInput, ToggleRow, fieldStyles, useWizardField } from "./fields";

/** Step 4: house rules and the house's vibe, as chips from fixed vocabularies (PRD D4, D5). */
export function RulesStep() {
  const { t, language } = useTranslation();
  const smoking = useWizardField("smoking_policy");
  const guests = useWizardField("guest_policy");
  const meal = useWizardField("meal_system");
  const study = useWizardField("study_friendly");
  const maid = useWizardField("maid_service");
  const quietStart = useWizardField("quiet_hours_start");
  const quietEnd = useWizardField("quiet_hours_end");
  const gateOpen = useWizardField("gate_open_time");
  const gateClose = useWizardField("gate_close_time");
  const vibe = useWizardField("vibe_tags");
  const managedBy = useWizardField("managed_by");
  const tenant = useWizardField("tenant_type");
  const notice = useWizardField("notice_period_days");
  const rentRevised = useWizardField("rent_last_revised_at");
  const full = vibe.value.length >= MAX_VIBE_TAGS;

  return (
    <>
      <StepCard>
        <FieldBlock label={t("mess.wizard.rules.smoking")} error={smoking.error}>
          <Segmented label={t("mess.wizard.rules.smoking")} value={smoking.value} onChange={smoking.onChange} options={SMOKING_POLICIES.map((value) => ({ value, label: t(`mess.smoking.${value}`) }))} />
        </FieldBlock>
        <FieldBlock label={t("mess.wizard.rules.guests")} error={guests.error}>
          <Segmented label={t("mess.wizard.rules.guests")} value={guests.value} onChange={guests.onChange} options={GUEST_POLICIES.map((value) => ({ value, label: t(`mess.guests.${value}`) }))} />
        </FieldBlock>
        <FieldBlock label={t("mess.wizard.rules.meal")} error={meal.error}>
          <Segmented label={t("mess.wizard.rules.meal")} value={meal.value} onChange={meal.onChange} options={MEAL_SYSTEMS.map((value) => ({ value, label: t(`mess.meal.${value}`) }))} />
        </FieldBlock>
        <ToggleRow label={t("mess.wizard.rules.study")} hint={t("mess.wizard.rules.studyHelp")} value={study.value} onChange={study.onChange} />
        <ToggleRow label={t("mess.wizard.rules.maid")} value={maid.value} onChange={maid.onChange} />
      </StepCard>

      <StepCard>
        <FieldBlock label={t("mess.wizard.rules.gate")} hint={t("mess.wizard.rules.gateHelp")} error={gateOpen.error ?? gateClose.error}>
          <View style={styles.timePair}>
            <TimeLabel label={t("mess.wizard.rules.gateOpen")}>
              <TimeInput label={`${t("mess.wizard.rules.gate")}: ${t("mess.wizard.rules.gateOpen")}`} value={gateOpen.value} onChange={gateOpen.onChange} />
            </TimeLabel>
            <TimeLabel label={t("mess.wizard.rules.gateClose")}>
              <TimeInput label={`${t("mess.wizard.rules.gate")}: ${t("mess.wizard.rules.gateClose")}`} value={gateClose.value} onChange={gateClose.onChange} />
            </TimeLabel>
          </View>
        </FieldBlock>
        <FieldBlock label={t("mess.wizard.rules.quietHours")} error={quietStart.error ?? quietEnd.error}>
          <View style={styles.timePair}>
            <TimeLabel label={t("mess.wizard.rules.from")}>
              <TimeInput label={`${t("mess.wizard.rules.quietHours")}: ${t("mess.wizard.rules.from")}`} value={quietStart.value} onChange={quietStart.onChange} />
            </TimeLabel>
            <TimeLabel label={t("mess.wizard.rules.to")}>
              <TimeInput label={`${t("mess.wizard.rules.quietHours")}: ${t("mess.wizard.rules.to")}`} value={quietEnd.value} onChange={quietEnd.onChange} />
            </TimeLabel>
          </View>
        </FieldBlock>
      </StepCard>

      <StepCard>
        <FieldBlock
          label={t("mess.wizard.rules.vibe")}
          hint={`${t("mess.wizard.rules.vibeHelp", { max: MAX_VIBE_TAGS })} ${t("mess.wizard.rules.vibeCount", { count: formatLocalizedNumber(vibe.value.length, language), max: formatLocalizedNumber(MAX_VIBE_TAGS, language) })}`}
          error={vibe.error}
        >
          <View style={styles.chips}>
            {VIBE_TAGS.map((tag) => {
              const selected = vibe.value.includes(tag);
              return (
                <MessChip
                  key={tag}
                  label={t(`mess.vibe.${tag}`)}
                  selected={selected}
                  disabled={!selected && full}
                  onPress={() => vibe.onChange(selected ? vibe.value.filter((value) => value !== tag) : [...vibe.value, tag])}
                />
              );
            })}
          </View>
        </FieldBlock>
      </StepCard>

      <StepCard>
        <FieldBlock label={t("mess.wizard.rules.managedBy")} error={managedBy.error}>
          <Segmented label={t("mess.wizard.rules.managedBy")} value={managedBy.value} onChange={managedBy.onChange} options={MANAGED_BY.map((value) => ({ value, label: t(`mess.managedBy.${value}`) }))} />
        </FieldBlock>
        <FieldBlock label={t("mess.wizard.rules.tenantType")} error={tenant.error}>
          <Segmented label={t("mess.wizard.rules.tenantType")} value={tenant.value} onChange={tenant.onChange} options={TENANT_TYPES.map((value) => ({ value, label: t(`mess.tenant.${value}`) }))} />
        </FieldBlock>
        <View style={fieldStyles.row}>
          <View style={fieldStyles.half}>
            <FieldBlock label={t("mess.wizard.rules.noticePeriod")} error={notice.error}>
              <NumberInput label={t("mess.wizard.rules.noticePeriod")} value={notice.value} onChange={notice.onChange} />
            </FieldBlock>
          </View>
          <View style={fieldStyles.half}>
            <FieldBlock label={t("mess.wizard.rules.rentRevised")} error={rentRevised.error}>
              <TextField label={t("mess.wizard.rules.rentRevised")} value={rentRevised.value} onChange={rentRevised.onChange} placeholder={t("mess.wizard.rules.rentRevisedPlaceholder")} maxLength={10} />
            </FieldBlock>
          </View>
        </View>
      </StepCard>
    </>
  );
}

function TimeLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.timeLabel}>
      <Text style={styles.timeLabelText}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timePair: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  timeLabel: { gap: 4 },
  timeLabelText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted },
});
