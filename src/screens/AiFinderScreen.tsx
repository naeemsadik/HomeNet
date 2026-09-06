import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Home,
  KeyRound,
  MapPin,
  RotateCcw,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type DimensionValue, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton, Eyebrow } from "@/components/ui";
import { getProperties } from "@/services/propertyApi";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

const steps = ["Goal", "Location", "Budget", "Matches"];

const budgetRanges: Record<string, { min_price?: number; max_price?: number }> = {
  "Under BDT 70k": { max_price: 70000 },
  "BDT 70k–120k": { min_price: 70000, max_price: 120000 },
  "BDT 120k–180k": { min_price: 120000, max_price: 180000 },
  "BDT 180k+": { min_price: 180000 },
  "Under BDT 2 Cr": { max_price: 20000000 },
  "BDT 2–4 Cr": { min_price: 20000000, max_price: 40000000 },
  "BDT 4–6 Cr": { min_price: 40000000, max_price: 60000000 },
  "BDT 6 Cr+": { min_price: 60000000 },
};

function Choice({
  label,
  copy,
  icon: Icon,
  selected,
  onPress,
  compact,
  width,
}: {
  label: string;
  copy: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
  width: DimensionValue;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, compact && styles.choiceCompact, selected && styles.choiceSelected, { width }, webPointer]}>
      {Icon ? <View style={[styles.choiceIcon, selected && styles.choiceIconSelected]}><Icon color={selected ? colors.white : colors.green} size={21} /></View> : null}
      <Text style={styles.choiceTitle}>{label}</Text>
      <Text style={styles.choiceCopy}>{copy}</Text>
      <View style={[styles.choiceCheck, selected && styles.choiceCheckSelected]}>{selected ? <Check color={colors.white} size={12} /> : null}</View>
    </Pressable>
  );
}

export function AiFinderScreen() {
  const { isPhone } = useResponsive();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("Buy a home");
  const [area, setArea] = useState("Gulshan & Banani");
  const [budget, setBudget] = useState("BDT 2–4 Cr");
  const [savedIds, setSavedIds] = useState<(string | number)[]>([]);

  const queryParams = useMemo(() => {
    const range = budgetRanges[budget] || {};
    return {
      listing_type: goal === "Rent a home" ? ("rent" as const) : ("sale" as const),
      limit: 6,
      status: "active" as const,
      ...range,
    };
  }, [goal, budget]);

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["properties", "ai-finder", goal, budget],
    queryFn: () => getProperties(queryParams),
    enabled: step === 3,
    staleTime: 5 * 60 * 1000,
  });

  const matches = useMemo(() => matchesData?.data?.items ?? [], [matchesData]);

  function toggleSaved(id: string | number) {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  const choiceWidth = isPhone ? "100%" : step === 0 ? "49%" : "23.8%";

  return (
    <AppChrome active="ai">
      <View style={[styles.intro, isPhone && styles.introPhone]}>
        <View style={styles.introIcon}><Sparkles color={colors.white} size={23} /></View>
        <Eyebrow style={styles.introEyebrow}>Personalized search</Eyebrow>
        <Text style={[styles.introTitle, isPhone && styles.introTitlePhone]}>Tell us what home feels right.</Text>
        <Text style={styles.introCopy}>HomeNet will rank verified options around your priorities and explain every match.</Text>
      </View>

      <View style={styles.finderShell}>
        <View style={styles.progress}>
          {steps.map((label, index) => {
            const active = index <= step;
            return (
              <View key={label} style={styles.progressItem}>
                {index < steps.length - 1 ? <View style={[styles.progressLine, index < step && styles.progressLineActive]} /> : null}
                <View style={[styles.progressCircle, active && styles.progressCircleActive]}>{index < step ? <Check color={colors.white} size={12} /> : <Text style={[styles.progressNumber, active && styles.progressNumberActive]}>{index + 1}</Text>}</View>
                {!isPhone ? <Text style={[styles.progressLabel, active && styles.progressLabelActive]}>{label}</Text> : null}
              </View>
            );
          })}
        </View>

        {step < 3 ? (
          <View style={[styles.question, isPhone && styles.questionPhone]}>
            <View style={styles.questionTitle}>
              {step === 0 ? <Home color={colors.green} size={19} /> : step === 1 ? <MapPin color={colors.green} size={19} /> : <WalletCards color={colors.green} size={19} />}
              <View>
                <Text style={styles.questionKicker}>{step === 0 ? "First, the big decision" : step === 1 ? "Your everyday radius" : "A comfortable range"}</Text>
                <Text style={styles.questionHeading}>{step === 0 ? "What are you looking to do?" : step === 1 ? "Where would you like to live?" : "What budget should we work within?"}</Text>
              </View>
            </View>
            <View style={styles.choiceGrid}>
              {step === 0 ? (
                <>
                  <Choice copy="Build equity in a place of your own" icon={Home} label="Buy a home" onPress={() => setGoal("Buy a home")} selected={goal === "Buy a home"} width={choiceWidth} />
                  <Choice copy="Stay flexible with a verified rental" icon={KeyRound} label="Rent a home" onPress={() => setGoal("Rent a home")} selected={goal === "Rent a home"} width={choiceWidth} />
                </>
              ) : step === 1 ? (
                [
                  ["Gulshan & Banani", "Central, connected, established"],
                  ["Baridhara", "Quiet streets and diplomatic zone"],
                  ["Dhanmondi", "Lakeside culture and city access"],
                  ["Uttara", "Planned neighborhoods and more space"],
                ].map(([label, copy]) => <Choice copy={copy} icon={Building2} key={label} label={label} onPress={() => setArea(label)} selected={area === label} width={choiceWidth} />)
              ) : (
                (goal === "Rent a home" ? ["Under BDT 70k", "BDT 70k–120k", "BDT 120k–180k", "BDT 180k+"] : ["Under BDT 2 Cr", "BDT 2–4 Cr", "BDT 4–6 Cr", "BDT 6 Cr+"]).map((label) => <Choice compact copy="Show homes in this range" key={label} label={label} onPress={() => setBudget(label)} selected={budget === label} width={choiceWidth} />)
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.results, isPhone && styles.resultsPhone]}>
            <View style={[styles.resultSummary, isPhone && styles.resultSummaryPhone]}>
              <View style={styles.resultIcon}><Sparkles color={colors.white} size={22} /></View>
              <View style={styles.resultCopyWrap}><Eyebrow style={styles.resultEyebrow}>Your strongest matches</Eyebrow><Text style={styles.resultTitle}>Homes aligned with your priorities</Text><Text style={styles.resultCopy}>{goal} around {area}, within {budget}. Ranked by value, verification, and livability.</Text></View>
              <AppButton icon={RotateCcw} label="Start over" onPress={() => setStep(0)} variant="ghost" />
            </View>
            {matchesLoading ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.green} />
                <Text style={{ marginTop: 12, color: colors.muted, fontFamily: fonts.medium }}>Finding matching properties...</Text>
              </View>
            ) : matches.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center", backgroundColor: "#F8FAF9", borderRadius: 16 }}>
                <Text style={{ fontSize: 16, fontFamily: fonts.bold, color: colors.ink }}>No matching listings found</Text>
                <Text style={{ marginTop: 6, color: colors.muted, fontFamily: fonts.regular, textAlign: "center" }}>
                  Try selecting a different budget range or browse all properties.
                </Text>
                <AppButton label="View all homes" onPress={() => setStep(0)} style={{ marginTop: 16 }} />
              </View>
            ) : (
              <PropertyGrid>
                {matches.map((property) => (
                  <PropertyCard
                    key={property.id}
                    mode={goal === "Rent a home" ? "rent" : "buy"}
                    onSave={() => toggleSaved(property.id)}
                    property={property}
                    saved={savedIds.includes(property.id)}
                  />
                ))}
              </PropertyGrid>
            )}
          </View>
        )}

        {step < 3 ? (
          <View style={[styles.actions, isPhone && styles.actionsPhone]}>
            <AppButton disabled={step === 0} icon={ArrowLeft} label="Back" onPress={() => setStep((current) => Math.max(0, current - 1))} variant="secondary" />
            <AppButton label={step === 2 ? "Build my matches" : "Continue"} onPress={() => setStep((current) => Math.min(3, current + 1))} trailingIcon={ArrowRight} />
          </View>
        ) : null}
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  intro: { maxWidth: 680, alignSelf: "center", alignItems: "center", marginTop: 18, marginBottom: 30 },
  introPhone: { marginTop: 8 },
  introIcon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", marginBottom: 14, borderRadius: 15, backgroundColor: colors.green, ...shadow },
  introEyebrow: { marginBottom: 7 },
  introTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 52, lineHeight: 54, letterSpacing: -3.1, textAlign: "center" },
  introTitlePhone: { fontSize: 36, lineHeight: 39, letterSpacing: -2.1 },
  introCopy: { maxWidth: 570, marginTop: 12, color: colors.muted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 18, textAlign: "center" },
  finderShell: { maxWidth: 910, width: "100%", alignSelf: "center", overflow: "hidden", borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow },
  progress: { flexDirection: "row", paddingHorizontal: 26, paddingVertical: 18, backgroundColor: "#F7FAF8", borderBottomWidth: 1, borderBottomColor: colors.line },
  progressItem: { position: "relative", flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  progressLine: { position: "absolute", top: 14, left: "58%", width: "84%", height: 1, backgroundColor: "#DDE6E1" },
  progressLineActive: { backgroundColor: colors.green },
  progressCircle: { zIndex: 1, width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: "#D8E2DD" },
  progressCircleActive: { backgroundColor: colors.green, borderColor: colors.green },
  progressNumber: { color: "#98A59F", fontFamily: fonts.extraBold, fontSize: 9 },
  progressNumberActive: { color: colors.white },
  progressLabel: { color: "#98A59F", fontFamily: fonts.extraBold, fontSize: 8 },
  progressLabelActive: { color: colors.greenDark },
  question: { minHeight: 330, paddingHorizontal: 34, paddingVertical: 32 },
  questionPhone: { minHeight: 0, paddingHorizontal: 16, paddingVertical: 24 },
  questionTitle: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 24 },
  questionKicker: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  questionHeading: { marginTop: 4, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 20, letterSpacing: -0.7 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { position: "relative", minHeight: 130, padding: 17, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  choiceSelected: { borderColor: colors.green, backgroundColor: "#F3FAF7" },
  choiceCompact: { minHeight: 92, justifyContent: "center" },
  choiceIcon: { width: 41, height: 41, alignItems: "center", justifyContent: "center", marginBottom: 13, borderRadius: 12, backgroundColor: colors.greenLight },
  choiceIconSelected: { backgroundColor: colors.green },
  choiceTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 11 },
  choiceCopy: { marginTop: 5, color: colors.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 13 },
  choiceCheck: { position: "absolute", top: 12, right: 12, width: 20, height: 20, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: "#D4DFD9" },
  choiceCheckSelected: { backgroundColor: colors.green, borderColor: colors.green },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 26, paddingVertical: 18, backgroundColor: "#FBFDFC", borderTopWidth: 1, borderTopColor: colors.line },
  actionsPhone: { paddingHorizontal: 16, paddingVertical: 14 },
  results: { padding: 26 },
  resultsPhone: { padding: 17 },
  resultSummary: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 24, padding: 17, borderRadius: 14, backgroundColor: "#F2F8F5" },
  resultSummaryPhone: { flexWrap: "wrap" },
  resultIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.green },
  resultCopyWrap: { minWidth: 0, flex: 1 },
  resultEyebrow: { marginBottom: 3 },
  resultTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 15 },
  resultCopy: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 13 },
});
