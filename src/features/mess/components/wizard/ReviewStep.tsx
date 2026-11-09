import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle, Edit } from "@/components/icons";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { MessMedia } from "../../types/mess";
import { previewCard, type MessListingForm, type WizardStep } from "../../utils/wizardForm";
import { MessListingCard } from "../MessListingCard";
import { FieldBlock, StepCard, TextField, useWizardField } from "./fields";

export interface ReviewProblem {
  message: string;
  step?: WizardStep;
}

const STEP_LABELS: Record<WizardStep, TranslationKey> = {
  place: "mess.wizard.steps.place",
  seats: "mess.wizard.steps.seats",
  costs: "mess.wizard.steps.costs",
  rules: "mess.wizard.steps.rules",
  photos: "mess.wizard.steps.photos",
  review: "mess.wizard.steps.review",
};

/** A title made from the answers, in the PRD's form: "Single seat in 4-person mess, Notun Bazar". */
export function useSuggestedTitle(values: MessListingForm): string {
  const { t, language } = useTranslation();
  const area = values.area_name || values.address.split(",")[0]?.trim() || "";
  if (!area) return "";
  if (values.subtype === "seat_share") return t("mess.wizard.titleTemplate.seatShare", { area });
  const kind = values.seats[0]?.seat_type === "single" ? "single" : "shared";
  return t(`mess.wizard.titleTemplate.${kind}`, { count: formatLocalizedNumber(values.total_seats, language), area });
}

/** Step 6: the title, then the listing as students will see it, with a way back to each step (PRD 3.3.1). */
export function ReviewStep({
  propertyId,
  media,
  onEditStep,
  problems,
}: {
  propertyId: string | null;
  media: MessMedia[];
  onEditStep: (step: WizardStep) => void;
  problems: ReviewProblem[];
}) {
  const { t } = useTranslation();
  const { control } = useFormContext<MessListingForm>();
  const values = useWatch({ control }) as MessListingForm;
  const title = useWizardField("title");
  const description = useWizardField("description");
  const suggestion = useSuggestedTitle(values);
  const card = previewCard({ ...values, title: values.title || suggestion }, media, propertyId);

  return (
    <>
      {problems.length ? (
        <View style={styles.problems} role="alert">
          <View style={styles.problemsHead}>
            <AlertCircle size={18} color={colorTokens.errorText} />
            <Text style={styles.problemsTitle}>{t("mess.wizard.problemsTitle")}</Text>
          </View>
          {problems.map((problem, index) => (
            <View key={`${problem.message}-${index}`} style={styles.problem}>
              <Text style={styles.problemText}>• {problem.message}</Text>
              {problem.step ? (
                <Pressable accessibilityRole="button" onPress={() => onEditStep(problem.step!)} style={webPointer}>
                  <Text style={styles.link}>{t("mess.wizard.fixStep", { step: t(STEP_LABELS[problem.step]) })}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <StepCard>
        <FieldBlock label={t("mess.wizard.place.title")} hint={t("mess.wizard.place.titleHelp")} error={title.error}>
          <TextField label={t("mess.wizard.place.title")} value={title.value} onChange={title.onChange} placeholder={suggestion} maxLength={120} />
          {suggestion && title.value.trim() !== suggestion ? (
            <Pressable accessibilityRole="button" onPress={() => title.onChange(suggestion)} style={[styles.suggestion, webPointer]}>
              <Text style={styles.suggestionText}>{t("mess.wizard.place.useSuggested", { title: suggestion })}</Text>
            </Pressable>
          ) : null}
        </FieldBlock>
        <FieldBlock label={t("mess.wizard.place.description")} error={description.error}>
          <TextField
            label={t("mess.wizard.place.description")}
            value={description.value}
            onChange={description.onChange}
            placeholder={t("mess.wizard.place.descriptionPlaceholder")}
            multiline
            maxLength={2000}
          />
        </FieldBlock>
      </StepCard>

      <StepCard title={t("mess.wizard.review.card")}>
        <Text style={styles.intro}>{t("mess.wizard.review.intro")}</Text>
        <View style={styles.preview}>
          <MessListingCard item={card} onPress={() => undefined} />
        </View>
      </StepCard>

      <StepCard title={t("mess.wizard.review.checklist")}>
        {(["place", "seats", "costs", "rules", "photos"] as const).map((step) => (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={t("mess.wizard.review.edit", { step: t(STEP_LABELS[step]) })}
            onPress={() => onEditStep(step)}
            style={({ hovered }: { hovered?: boolean }) => [styles.editRow, hovered && styles.editRowHovered, webPointer]}
          >
            <Text style={styles.editLabel}>{t(STEP_LABELS[step])}</Text>
            <Edit size={16} color={colorTokens.brandText} />
          </Pressable>
        ))}
      </StepCard>
    </>
  );
}

const styles = StyleSheet.create({
  problems: { gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colorTokens.errorSurface },
  problemsHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  problemsTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.errorText },
  problem: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10, rowGap: 2 },
  problemText: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colorTokens.ink },
  link: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.brandText, textDecorationLine: "underline" },
  suggestion: { alignSelf: "flex-start", paddingVertical: 4 },
  suggestionText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.brandText, textDecorationLine: "underline" },
  intro: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted },
  preview: { maxWidth: 380, width: "100%" },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
  },
  editRowHovered: { backgroundColor: colorTokens.surfaceSunken },
  editLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
});
