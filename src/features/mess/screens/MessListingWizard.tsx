import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { AppChrome } from "@/components/AppChrome";
import { ArrowLeft, Check, CheckCircle2, Send } from "@/components/icons";
import { PageMeta } from "@/components/PageMeta";
import { AppButton } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { showToast } from "@/lib/toast";
import { toApiError } from "@/services/apiClient";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { CostsStep } from "../components/wizard/CostsStep";
import { PhotosStep } from "../components/wizard/PhotosStep";
import { PlaceStep } from "../components/wizard/PlaceStep";
import { ReviewStep, type ReviewProblem } from "../components/wizard/ReviewStep";
import { RulesStep } from "../components/wizard/RulesStep";
import { SeatsStep } from "../components/wizard/SeatsStep";
import { useSubmitMess, useUpsertMess } from "../hooks/useMessMutations";
import { useMessDetail } from "../hooks/useMessQueries";
import { missingPhotos, STEP_FIELDS, validateStep, type StepIssue } from "../schemas/messListing";
import { useMessWizardStore } from "../stores/messWizardStore";
import type { MediaLabel, MessMedia } from "../types/mess";
import { emptyForm, formFromDetail, WIZARD_STEPS, dtoForStep, type MessListingForm, type WizardStep } from "../utils/wizardForm";

const STEP_LABELS: Record<WizardStep, TranslationKey> = {
  place: "mess.wizard.steps.place",
  seats: "mess.wizard.steps.seats",
  costs: "mess.wizard.steps.costs",
  rules: "mess.wizard.steps.rules",
  photos: "mess.wizard.steps.photos",
  review: "mess.wizard.steps.review",
};

/** Array fields whose own errors (not their items') sit under `.root`, as useFieldArray reads them. */
const FIELD_ARRAYS = new Set(["seats", "charges"]);

/** True once the persisted wizard store has been read back from storage. */
function useWizardStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useMessWizardStore.persist.onFinishHydration(onChange),
    () => useMessWizardStore.persist.hasHydrated(),
    () => false,
  );
}

interface WizardStart {
  values: MessListingForm;
  propertyId: string | null;
  step: WizardStep;
  media: MessMedia[];
  /** The listing's status when editing; null for a new listing. */
  status: string | null;
  resumed: boolean;
}

/**
 * The 6-step listing wizard (PRD 3.3). New listings resume from the device;
 * edits load the listing from the server.
 */
export function MessListingWizard({ editId }: { editId?: string }) {
  const { t } = useTranslation();
  const hydrated = useWizardStoreHydrated();
  const [attempt, setAttempt] = useState(0);
  // Where the wizard starts is decided once. After that the form owns the state:
  // the draft id the first save writes to the store must not restart it.
  const [frozen, setFrozen] = useState<WizardStart | null>(null);
  const stored = hydrated && !editId ? useMessWizardStore.getState() : null;
  // A resumed draft's photos are on the server: load them before starting.
  const sourceId = frozen ? undefined : (editId ?? stored?.propertyId ?? undefined);
  const source = useMessDetail(sourceId);

  let start: WizardStart | null = frozen;
  let failed = false;
  if (!start && editId) {
    if (source.data) {
      start = { values: formFromDetail(source.data), propertyId: editId, step: "place", media: source.data.media, status: source.data.status, resumed: false };
    } else failed = source.isError;
  } else if (!start && stored) {
    if (!stored.propertyId) {
      start = { values: stored.values ?? emptyForm(), propertyId: null, step: stored.values ? stored.step : "place", media: [], status: null, resumed: Boolean(stored.values) };
    } else if (source.data) {
      start = { values: stored.values ?? formFromDetail(source.data), propertyId: stored.propertyId, step: stored.step, media: source.data.media, status: null, resumed: true };
    } else if (source.isError) {
      // The saved draft is gone from the server: start again rather than strand the lister.
      start = { values: emptyForm(), propertyId: null, step: "place", media: [], status: null, resumed: false };
    }
  }
  if (start && !frozen) setFrozen(start);

  return (
    <AppChrome active="post">
      <PageMeta title={editId ? t("mess.meta.editTitle") : t("mess.meta.createTitle")} noindex />
      {start ? (
        <WizardForm
          key={`${editId ?? "new"}-${attempt}`}
          start={start}
          isEdit={Boolean(editId)}
          onStartOver={() => {
            useMessWizardStore.getState().reset();
            setFrozen(null);
            setAttempt((value) => value + 1);
          }}
        />
      ) : failed ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>{t("mess.wizard.loadFailed")}</Text>
          <AppButton label={t("mess.browse.retry")} onPress={() => void source.refetch()} variant="secondary" />
        </View>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorTokens.brand} />
        </View>
      )}
    </AppChrome>
  );
}

function WizardForm({ start, isEdit, onStartOver }: { start: WizardStart; isEdit: boolean; onStartOver: () => void }) {
  const { t, language } = useTranslation();
  const { isPhone } = useResponsive();
  const form = useForm<MessListingForm>({ defaultValues: start.values });
  const saveDraft = useMessWizardStore((s) => s.save);
  const resetDraft = useMessWizardStore((s) => s.reset);
  const upsert = useUpsertMess();
  const submit = useSubmitMess();
  const [step, setStep] = useState<WizardStep>(start.step);
  const [furthest, setFurthest] = useState(isEdit ? WIZARD_STEPS.length - 1 : WIZARD_STEPS.indexOf(start.step));
  const [propertyId, setPropertyId] = useState<string | null>(start.propertyId);
  const [media, setMedia] = useState<MessMedia[]>(start.media);
  const [photoErrors, setPhotoErrors] = useState<Partial<Record<MediaLabel, string>>>({});
  const [problems, setProblems] = useState<ReviewProblem[]>([]);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new listing's answers are kept on the device as they are typed.
  const { subscribe } = form;
  useEffect(() => {
    if (isEdit) return;
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => saveDraft({ values }), 400);
      },
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [subscribe, isEdit, saveDraft]);

  const index = WIZARD_STEPS.indexOf(step);

  const goTo = (target: WizardStep) => {
    setStep(target);
    setSaveError(null);
    setFurthest((value) => Math.max(value, WIZARD_STEPS.indexOf(target)));
    if (!isEdit) saveDraft({ step: target });
    if (Platform.OS === "web" && typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showIssues = (issues: StepIssue[]) => {
    for (const issue of issues) {
      const path = FIELD_ARRAYS.has(issue.path) ? `${issue.path}.root` : issue.path;
      form.setError(path as never, { type: "custom", message: issue.message });
    }
  };

  /** A step's problems, shown on its fields. Photos are not form fields and are checked here too. */
  const checkStep = (target: WizardStep): boolean => {
    form.clearErrors(STEP_FIELDS[target]);
    const issues = validateStep(target, form.getValues());
    showIssues(issues);
    let ok = issues.length === 0;
    if (target === "photos") {
      const missing = missingPhotos(media);
      setPhotoErrors(Object.fromEntries(missing.map((item) => [item.label, t(item.message)])));
      ok = ok && missing.length === 0;
    }
    return ok;
  };

  const save = async (target: WizardStep): Promise<string | null> => {
    const result = await upsert.mutateAsync(dtoForStep(target, form.getValues(), propertyId));
    if (!propertyId) {
      setPropertyId(result.id);
      if (!isEdit) saveDraft({ propertyId: result.id });
    }
    return result.id;
  };

  const describeFailure = (raw: unknown) => {
    const error = toApiError(raw);
    return error.validationErrors.length ? `${t("mess.wizard.saveFailed")} ${error.validationErrors.join(" ")}` : t("mess.wizard.saveFailed");
  };

  const next = async () => {
    if (!checkStep(step)) return;
    setBusy(true);
    setSaveError(null);
    try {
      await save(step);
      goTo(WIZARD_STEPS[index + 1]);
    } catch (raw) {
      setSaveError(describeFailure(raw));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setProblems([]);
    for (const target of WIZARD_STEPS) {
      if (!checkStep(target)) {
        if (target !== step) goTo(target);
        return;
      }
    }
    setBusy(true);
    setSaveError(null);
    try {
      const id = await save("review");
      if (!id) return;
      if (isEdit && start.status && start.status !== "draft") {
        showToast(t("mess.wizard.changesSaved"));
        router.replace("/mess/my" as never);
        return;
      }
      await submit.mutateAsync(id);
      if (!isEdit) resetDraft();
      setSubmittedId(id);
    } catch (raw) {
      const error = toApiError(raw);
      if (error.status === 422 && error.validationErrors.length) {
        setProblems(error.validationErrors.map((message) => ({ message })));
      } else {
        setSaveError(describeFailure(raw));
      }
    } finally {
      setBusy(false);
    }
  };

  if (submittedId) {
    return (
      <View style={[styles.column, styles.done]}>
        <CheckCircle2 size={48} color={colorTokens.brandText} />
        <Text accessibilityRole="header" aria-level={1} style={styles.doneTitle}>
          {t("mess.wizard.submitted")}
        </Text>
        <Text style={styles.doneBody}>{t("mess.wizard.submittedBody")}</Text>
        <View style={styles.doneActions}>
          <AppButton label={t("mess.my.title")} onPress={() => router.replace("/mess/my" as never)} />
          <AppButton label={t("mess.my.view")} onPress={() => router.replace(`/mess/${submittedId}` as never)} variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <FormProvider {...form}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text accessibilityRole="header" aria-level={1} style={[styles.h1, isPhone && styles.h1Phone]}>
            {isEdit ? t("mess.wizard.editTitle") : t("mess.wizard.title")}
          </Text>
          <Text style={styles.stepOf}>
            {t("mess.wizard.stepOf", { step: formatLocalizedNumber(index + 1, language), total: formatLocalizedNumber(WIZARD_STEPS.length, language) })} ·{" "}
            {t(STEP_LABELS[step])}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((index + 1) / WIZARD_STEPS.length) * 100}%` }]} />
          </View>
          {!isPhone ? (
            <View style={styles.steps} role="tablist">
              {WIZARD_STEPS.map((target, position) => {
                const reachable = position <= furthest;
                const current = target === step;
                return (
                  <Pressable
                    key={target}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: current, disabled: !reachable }}
                    disabled={!reachable || busy}
                    onPress={() => goTo(target)}
                    style={[styles.stepPill, current && styles.stepPillCurrent, !reachable && styles.stepPillLocked, webPointer]}
                  >
                    {position < index ? <Check size={13} color={colorTokens.brandText} /> : null}
                    <Text style={[styles.stepPillText, current && styles.stepPillTextCurrent]}>{t(STEP_LABELS[target])}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {start.resumed && !isEdit ? (
            <View style={styles.resume}>
              <Text style={styles.resumeText}>{t("mess.wizard.resume")}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  if (await confirmAction(t("mess.wizard.startOver"), t("mess.wizard.startOverConfirm"))) onStartOver();
                }}
                style={webPointer}
              >
                <Text style={styles.resumeLink}>{t("mess.wizard.startOver")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {step === "place" ? <PlaceStep /> : null}
        {step === "seats" ? <SeatsStep /> : null}
        {step === "costs" ? <CostsStep /> : null}
        {step === "rules" ? <RulesStep /> : null}
        {step === "photos" && propertyId ? (
          <PhotosStep
            propertyId={propertyId}
            media={media}
            onMediaChange={(next) => {
              setMedia(next);
              setPhotoErrors({});
            }}
            photoErrors={photoErrors}
          />
        ) : null}
        {step === "review" ? <ReviewStep propertyId={propertyId} media={media} onEditStep={goTo} problems={problems} /> : null}

        {saveError ? (
          <Text accessibilityLiveRegion="polite" role="alert" style={styles.saveError}>
            {saveError}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {index > 0 ? (
            <AppButton label={t("mess.wizard.back")} icon={ArrowLeft} onPress={() => goTo(WIZARD_STEPS[index - 1])} variant="secondary" disabled={busy} />
          ) : (
            <View />
          )}
          {step === "review" ? (
            <AppButton
              label={busy ? t("mess.wizard.submitting") : isEdit && start.status && start.status !== "draft" ? t("mess.wizard.saveChanges") : t("mess.wizard.submit")}
              icon={Send}
              loading={busy}
              onPress={() => void finish()}
            />
          ) : (
            <AppButton label={busy ? t("mess.wizard.saving") : t("mess.wizard.next")} loading={busy} onPress={() => void next()} />
          )}
        </View>
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 14, paddingVertical: 80 },
  centerText: { fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  column: { width: "100%", maxWidth: 760, alignSelf: "center", paddingTop: 16, paddingBottom: 48, gap: 16 },
  header: { gap: 8 },
  h1: { fontFamily: fonts.headingExtraBold, fontSize: 28, lineHeight: 36, color: colorTokens.ink },
  h1Phone: { fontSize: 23, lineHeight: 30 },
  stepOf: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.muted },
  progressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colorTokens.surfaceSunken, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colorTokens.brand },
  steps: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
  },
  stepPillCurrent: { borderColor: colorTokens.brandBorder, backgroundColor: colorTokens.brandSurface },
  stepPillLocked: { opacity: 0.5 },
  stepPillText: { fontFamily: fonts.medium, fontSize: 12, color: colorTokens.body },
  stepPillTextCurrent: { fontFamily: fonts.semiBold, color: colorTokens.brandText },
  resume: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colorTokens.surfaceSunken },
  resumeText: { fontFamily: fonts.medium, fontSize: 14, color: colorTokens.body },
  resumeLink: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText, textDecorationLine: "underline" },
  saveError: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colorTokens.errorText },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 8 },
  done: { alignItems: "center", gap: 12, paddingVertical: 48 },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colorTokens.ink, textAlign: "center" },
  doneBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colorTokens.muted, textAlign: "center", maxWidth: 480 },
  doneActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 8 },
});
